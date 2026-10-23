# Arquitetura — Backend Python

> Materializa [`../../_shared/architecture-principles.md`](../../_shared/architecture-principles.md)
> em estrutura de pastas e padrões concretos de Python. Stack e versões: [`stack.md`](stack.md).

## 1. Estrutura de pastas

Screaming architecture: a árvore revela os domínios, não o FastAPI.

```
app/
  main.py                 composition root da API (ASGI)
  worker.py               composition root do worker Temporal
  config.py               Settings tipado (pydantic-settings), único ponto de env

  flows/                  DOMÍNIO — fluxos e contratos de agente como dado versionado
    api.py                rotas
    service.py            regra de negócio
    models.py             modelos de transporte (pydantic, frozen)
    loader.py             carrega flow.yaml + agents/*.yaml de um commit
    linter.py             validação estrutural e semântica do DAG
  runs/                   DOMÍNIO — execução de fluxo (start, status, cancel, gate)
    api.py  service.py  models.py  entities.py  repository.py
  steps/                  DOMÍNIO — etapa: bundle, contrato, tentativa
    bundler.py            monta o bundle (agent-execution.md §2)
    contract.py           valida result.json e artefatos contra o exigido
  validation/             DOMÍNIO — validadores e loop de crítica
    runner.py             executa validadores de schema e de comando
    critique.py           monta critique.md a partir da saída dos validadores
  gates/                  DOMÍNIO — aprovação humana, diff e auditoria de decisão
    api.py  service.py  models.py  entities.py  repository.py
  artifacts/              DOMÍNIO — artefatos versionados, por referência
    api.py  service.py  models.py  entities.py  repository.py
    git_store.py          fonte de verdade: repo, branch, commit
    blob_store.py         complementar: logs, prompt/resposta, binário grande

  motor/                  FRONTEIRA — durabilidade/fila/retry (Temporal)
    protocol.py           interface MotorDeExecucao — o que o domínio conhece
    temporal/
      motor.py            implementação do Protocol
      workflow.py         Workflow — orquestração determinística (código do motor)
      activities.py       Activities — chamam os serviços de domínio, não os contêm
  auth/                   DOMÍNIO — identidade, papéis e autorização (OIDC/Keycloak)
    api.py  service.py  models.py  dependencies.py
  runners/                FRONTEIRA — execução do agente, isolada por implementação
    protocol.py           interface Runner (Protocol)
    claude_cli.py  goose.py       implementações intercambiáveis
    docker_sandbox.py     ciclo de vida do container efêmero
  integrations/           FRONTEIRA — um pacote por sistema externo
    vertex/               emissão/validação de credencial
    git/                  clone, branch isolada, commit, diff
  core/                   compartilhado entre domínios: erros, segurança, logging, telemetria
  util/                   genérico, sem dependência de framework nem de domínio
tests/
  unit/  integration/  contract/
```

Regras:

- Um domínio **não** importa de outro domínio. Se precisar, o que ele precisa pertence a `core/`
  ou a colaboração pertence ao serviço de nível acima (`runs`).
- `util/` não importa nada de `app/`. Se importar, não é `util/`.
- `runners/` e `integrations/` não importam domínio. A dependência é sempre domínio → fronteira,
  via interface declarada em `protocol.py`.

## 2. Camadas e dependências permitidas

| Camada | Arquivo | Pode depender de | Nunca |
|---|---|---|---|
| Entrada | `api.py` | `service`, `models` | `entities`, `repository`, `runners` |
| Serviço | `service.py` | `repository`, `models`, `entities`, `core`, portas de fronteira | `api` |
| Workflow | `motor/temporal/workflow.py` | Assinaturas de activities, `models` | I/O de qualquer tipo, relógio, `random`, rede, banco |
| Activity | `motor/temporal/activities.py` | `service` dos domínios, fronteiras | `workflow` |
| Persistência | `repository.py` | `entities` | `service`, `api` |
| Entidade | `entities.py` | Nada interno | Tudo |
| Fronteira | `runners/`, `integrations/` | Seus próprios modelos | Domínios |
| Config | `config.py` | — | — |

**Regra crítica** (do transversal): entidade SQLAlchemy **nunca** cruza a camada de entrada. A
conversão entidade → modelo pydantic acontece **no serviço**. `response_model` do FastAPI não
substitui essa conversão — ele a verifica.

## 3. Separação workflow × activity

Esta é a divisão mais importante do sistema, e a mais fácil de quebrar sem perceber.

Workflow e activity são **código do motor**, e por isso vivem em `motor/temporal/`, não dentro de
`runs/` ([`flow-contracts.md`](flow-contracts.md) §7). A activity é uma casca fina: ela chama o
serviço de domínio e traduz o resultado. Regra de negócio dentro de activity é regra de negócio
presa ao Temporal.

- **Workflow** é orquestração determinística e replayável: decide qual etapa vem depois, trata
  falha, aplica política de retry. É código que o Temporal **reexecuta do início** a cada replay.
- **Activity** é tudo que toca o mundo: criar container, montar bundle, ler/gravar banco, subir
  artefato, chamar rede.
- Dentro do workflow são proibidos: `datetime.now()`, `random`, `uuid4()`, leitura de env,
  qualquer I/O, e importar módulo que faça isso no topo. Use as APIs de tempo/aleatoriedade do
  próprio Temporal.
- Toda activity é **idempotente** por `(run_id, step_id, attempt_key)`. Reexecução é o caso
  normal, não a exceção — ver [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §6.
- Payload que cruza a fronteira workflow↔activity é pequeno e serializável: identificadores e
  ponteiros, **nunca** conteúdo de artefato.

## 4. Padrões táticos

| Padrão | Como |
|---|---|
| Modelos de transporte imutáveis | `pydantic.BaseModel` com `model_config = ConfigDict(frozen=True, extra="forbid")` |
| Injeção de dependência | Construtor nas classes de serviço; `Depends` do FastAPI só na borda, resolvendo para o construtor. Sem singleton global, sem service locator |
| Configuração tipada | `Settings(BaseSettings)` único, instanciado uma vez no startup e injetado. `os.environ` fora de `config.py` é falha de review |
| Interface de fronteira | `typing.Protocol` em `protocol.py`. Sem ABC herdada por conveniência |
| Erros de negócio | Exceções nomeadas em `core/errors.py`, herdando de uma raiz `DomainError`. Nunca `Exception`/`ValueError` cru para regra de negócio |
| Handler global de erro | Um `exception_handler` traduz `DomainError` → Problem Details RFC 7807 — ver [`../../_shared/api-standards.md`](../../_shared/api-standards.md) §3 |
| Async | O caminho de I/O é `async` de ponta a ponta. Função síncrona bloqueante dentro de `async def` é bug de performance silencioso — isolar em executor |

## 5. Fluxo de uma execução

```
POST /v1/runs → api → service → resolve framework@commit → persiste Run → motor.iniciar() → 202
Workflow → por etapa, por tentativa:
    activity.montar_bundle → activity.executar_etapa → activity.validar_artefatos
      ├─ reprovou e há tentativa → activity.montar_critique → nova tentativa (mesma etapa)
      └─ aprovou → activity.commitar_artefatos → gate? → espera sinal → próxima etapa
activity.executar_etapa → runners.Runner (Protocol) → docker_sandbox → container efêmero
                        → lê out/result.json → devolve ponteiros
```

Regras estruturais:

- A API **nunca** bloqueia esperando etapa. Acompanhamento por `GET /v1/runs/{id}` e por stream
  de eventos publicado pelo worker (SSE) — o motor é orientado a "etapa concluída", o tempo real
  vem de canal paralelo.
- Uma tentativa = uma activity. O loop de crítica é laço **de workflow**, nunca dentro de activity.
- O commit dos artefatos acontece **depois** da validação, feito pelo orquestrador na branch
  isolada da execução. O agente nunca commita nem faz push.
- Toda a execução carrega `framework@commit` fixado no início
  ([`flow-contracts.md`](flow-contracts.md) §1).

## 6. Protocolo de uso pela IA

Ao gerar ou alterar código nesta stack:

1. Identificar o domínio afetado. Se a mudança atravessa dois domínios, parar e reavaliar o
   desenho antes de codificar.
2. Alterar na ordem: `models` → `service` → `api`. Nunca começar pela rota.
3. Código que toca o mundo externo vira activity, nunca entra no workflow.
4. Nova fronteira externa exige interface em `protocol.py` antes da implementação.
5. Novo tipo de erro de negócio exige entrada em `core/errors.py` e mapeamento no handler global.

---

## Checklist

- [ ] Árvore de pastas revela domínios, não o framework
- [ ] Nenhum import cruzado entre domínios
- [ ] Entidade SQLAlchemy não cruza a camada de entrada
- [ ] Workflow sem I/O, sem relógio, sem aleatoriedade
- [ ] Activities idempotentes por chave de tentativa
- [ ] Payload workflow↔activity com ponteiros, não conteúdo
- [ ] Modelos de transporte `frozen=True, extra="forbid"`
- [ ] `os.environ` apenas em `config.py`
- [ ] Fronteira externa por `Protocol`, implementação fora do domínio
- [ ] Motor de durabilidade atrás de `Protocol`; tipos do Temporal fora do domínio
- [ ] `workflow.py`/`activities.py` em `motor/temporal/`, não em domínio; activity sem regra de negócio
- [ ] Uma tentativa = uma activity; loop de crítica no workflow
- [ ] Commit feito pelo orquestrador após validação, em branch isolada
- [ ] Execução carrega `framework@commit` fixado no início
- [ ] Erros de negócio nomeados + handler global RFC 7807
