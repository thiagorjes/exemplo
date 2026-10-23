# Orquestração com Temporal — Backend Python

> Condicional da coleção. Materializa [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md)
> no lado do orquestrador. O lado do ambiente de execução está em
> [`../../infra/docker/ephemeral-runners.md`](../../infra/docker/ephemeral-runners.md).
> Decisão: [ADR-002](../../../../docs/decisions/ADR-002-temporal-motor-de-fluxo.md).

## 1. Por que Temporal carrega o fluxo

O problema difícil deste sistema não é chamar um modelo — é sobreviver a etapas longas que falham
no meio. Durabilidade, retry com backoff, timeout, cancelamento, replay e histórico auditável são
exatamente o que o Temporal entrega. **Não reimplementar** nenhum deles em código de aplicação:
máquina de estado própria em cima do Temporal é a duplicação mais cara possível.

O que **não** é do Temporal: regra de negócio, contrato de artefato, política de segurança.

## 2. Mapeamento de conceitos

| Conceito do domínio | Temporal |
|---|---|
| Definição de fluxo | Workflow Type (versionado) |
| Execução de fluxo (`Run`) | Workflow Execution, `workflow_id = run:{run_id}` |
| Etapa | Sequência de activities: montar bundle → executar → validar artefatos |
| Aprovação / intervenção humana | Signal + `wait_condition` com timeout |
| Consulta de progresso | Query (estado corrente) + projeção no Postgres para listagem |
| Cancelamento | Cancellation, com cleanup obrigatório do container |

`workflow_id` é determinístico e derivado do `run_id` — é ele que garante que o mesmo disparo não
gere duas execuções (`WorkflowIDReusePolicy` explícito).

## 3. Regras de workflow

- Código de workflow é **determinístico**: sem I/O, sem `datetime.now()`, sem `random`, sem
  `uuid4()`, sem leitura de env, sem import com efeito colateral. Use `workflow.now()`,
  `workflow.uuid4()`, `workflow.random()`.
- Toda lógica não determinística vive em activity. Sem exceção, inclusive "só para logar".
- Workflow em execução é código antigo rodando: mudar a sequência de activities quebra o replay.
  Alteração incompatível exige `workflow.patched()` ou novo Workflow Type versionado
  (`FluxoV2`) — nunca edição silenciosa.
- Histórico é limitado: fluxo com muitas etapas ou muitas iterações usa
  `continue_as_new`. Loop sem essa saída é bomba-relógio.
- Payload de workflow e de activity contém **identificadores e ponteiros**, nunca conteúdo de
  artefato. Conteúdo vive no armazenamento de artefatos; o Temporal guarda a referência.

## 4. Regras de activity

- Uma activity = um efeito colateral coeso. Activity que faz três coisas não é reexecutável.
- **Idempotência obrigatória** por chave `(run_id, step_id, attempt)`. Reexecução é o caso normal.
- `start_to_close_timeout` obrigatório em toda activity. Activity longa (execução de etapa) também
  declara `heartbeat_timeout` e emite heartbeat — sem heartbeat, o Temporal não sabe distinguir
  trabalho lento de worker morto.
- Heartbeat carrega progresso; em retry, a activity usa o progresso heartbeated para não refazer
  o que já fez.
- Activity respeita cancelamento: ao receber cancelamento durante a execução de uma etapa, **mata
  e remove o container** antes de retornar. Container órfão é vazamento de custo e de credencial.
- `RetryPolicy` explícita por activity, alinhada à tabela de causas de
  [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §6. Erro não recuperável é
  lançado como `ApplicationError(non_retryable=True)` — deixar o default tentar cinco vezes um
  erro de contrato é desperdício com cara de resiliência.

## 5. Task queues e workers

- Task queue separada por perfil de trabalho: `orchestration` (workflows, leve) e `step-execution`
  (activities que criam containers, pesada). Compartilhar fila faz etapa pesada matar o progresso
  do fluxo.
- Worker declara `max_concurrent_activities` **derivado por fórmula** de memória, disco e vCPU
  ([`../../infra/docker/architecture.md`](../../infra/docker/architecture.md) §5.1) — é este
  número, não o Temporal, que protege a máquina.
- Worker é stateless e horizontalmente escalável. Estado local em worker quebra failover.
- **Encerramento é drain, não morte.** `SIGTERM` para de aceitar tarefas, aguarda as etapas em voo
  até um prazo declarado e, ao expirar, cancela com limpeza de container e rede
  ([`../../infra/docker/ci-cd.md`](../../infra/docker/ci-cd.md) §4). Worker morto sem drain deixa
  container vivo, credencial válida e tokens gastos sem resultado.
- Sandbox de workflow do SDK Python fica **habilitado**; a necessidade de desabilitá-lo é sinal de
  import indevido dentro do módulo de workflow.

## 6. Limites e custo

- Todo fluxo tem `execution_timeout`; toda etapa tem `start_to_close_timeout` e teto de
  custo/tokens vindos da definição da etapa.
- O orçamento é debitado da **medição do `egress-proxy`**, que vê toda chamada ao provedor. O
  consumo autorrelatado em `result.json` é estimativa para relatório, **nunca** controle: quem
  reporta é a própria coisa que se quer limitar
  ([`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §6).
- Verificação **antes** de iniciar a etapa (orçamento restante do run) e **durante** a execução:
  estouro em voo mata o container, sem esperar a etapa terminar. Causa `budget_exceeded`, sem
  retry automático.
- Consumo acumulado do run é persistido no Postgres, não derivado do histórico do Temporal.

## 7. Persistência e projeção

- O Temporal é a verdade sobre **execução**; o Postgres é a verdade sobre **catálogo e projeção**
  (definições de fluxo, metadados de artefato, listagem e busca de runs).
- A projeção é atualizada por activity, dentro do fluxo — nunca por polling do histórico.
- Divergência entre projeção e Temporal é resolvida **sempre** a favor do Temporal.

---

## Checklist

- [ ] Nenhuma máquina de estado própria duplicando retry/timeout do Temporal
- [ ] `workflow_id` determinístico + política de reuso explícita
- [ ] Workflow determinístico; toda não determinação em activity
- [ ] Mudança incompatível via `patched()` ou novo Workflow Type
- [ ] `continue_as_new` em fluxo longo ou com loop
- [ ] Payloads com ponteiros, não conteúdo
- [ ] Activity idempotente por chave, com timeout e heartbeat
- [ ] Cancelamento remove o container antes de retornar
- [ ] `RetryPolicy` explícita; erro de contrato marcado `non_retryable`
- [ ] Filas separadas por perfil; concorrência derivada por fórmula
- [ ] Worker com drain no `SIGTERM` e limpeza ao expirar o prazo
- [ ] Orçamento debitado da medição do proxy; estouro em voo mata o container
- [ ] Projeção atualizada por activity; Temporal prevalece em divergência
