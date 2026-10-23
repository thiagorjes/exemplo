# Fluxos e Contratos de Agente — Backend Python

> Condicional da coleção. Materializa [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md)
> §2.5, §3.5 e §3.6. Decisão: [ADR-005](../../../../docs/decisions/ADR-005-fluxo-como-dado-versionado.md).

## 1. Fluxo é dado, não código

A definição de um framework (IDSD, SPDD, SDD) é um **arquivo declarativo versionado em Git**, não
um módulo Python e não um artefato deployado em outro sistema.

Consequências que não são negociáveis:

- Diff de fluxo é revisável em pull request. Formato gerado por ferramenta visual (XML com
  coordenadas de layout) é proibido — torna o review inviável e o merge conflituoso.
- A versão do framework é o **commit**. Uma execução fixa `framework@<commit>` no início e o
  carrega até o fim; alterar o fluxo nunca muda execução em andamento.
- Não existe segunda fonte de verdade. O que está no Git é o que executa.
- Adicionar um agente = adicionar um contrato + uma etapa no fluxo. **Sem redeploy**: o worker é
  genérico, o tipo de trabalho é `agent`, a identidade vem do contrato.

## 2. Estrutura no repositório do framework

```
frameworks/<framework>/
  flow.yaml              DAG: etapas, dependências, gates, entradas do fluxo
  agents/<id>.yaml       um contrato por agente
  schemas/*.schema.json  schemas dos artefatos
  scripts/*.sh           validadores executáveis
```

## 3. Contrato de agente

Campos obrigatórios: `id`, `runtime`, `skill`, `inputs`, `outputs`, `validators`, `retries`,
`limits` (tempo de parede e teto de custo/tokens), `network` (padrão `none`), `mcp` (padrão vazio).

- `runtime` é **campo de configuração**, não escolha de código: `claude-code`, `gemini-cli`,
  `codex`, `goose` são intercambiáveis ([`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §4).
- `inputs`/`outputs` são caminhos de artefato relativos ao repositório, nunca caminhos absolutos
  do host.
- `retries` é o teto do loop de crítica (§5), não retry de infraestrutura — este é do motor.
- Contrato sem `limits` não carrega. Ausência de limite não é "sem limite": é incidente com data.
- Campo desconhecido no contrato é **erro de carga**, não aviso. Typo em nome de campo que vira
  default silencioso é a classe de bug mais cara aqui.

## 4. Linter de fluxo (gate de CI)

Roda no CI do repositório do framework e no carregamento pela aplicação. Falha o merge quando:

- `flow.yaml` ou contrato não valida contra o JSON Schema.
- Etapa referencia agente inexistente, ou agente referencia skill inexistente.
- **Todo `input` de uma etapa não é `output` de etapa anterior nem entrada declarada do fluxo** —
  a checagem semântica que nenhuma ferramenta visual oferece, e o motivo principal de o fluxo ser
  dado validável.
- O grafo tem ciclo, etapa órfã ou etapa inalcançável.
- Dois outputs diferentes escrevem o mesmo caminho de artefato.
- Validador referencia schema ou script ausente.
- Contrato sem `limits`, ou com `network` aberta sem lista de destinos permitidos.

A aplicação **revalida no carregamento** e recusa um fluxo inválido, mesmo que já commitado. CI
pode ser contornado; o carregador, não.

## 5. Execução do loop de crítica

```
executar etapa → validar artefatos → falhou? → montar critique.md → reexecutar a MESMA etapa
                                    ↓ passou
                             commit na branch da execução → próxima etapa
```

- `critique.md` contém a saída **dos validadores**, não uma reinterpretação dela. Resumir a
  crítica remove a informação que o agente precisa para corrigir.
- Tentativa `n+1` recebe também o que foi produzido em `n`, para corrigir em vez de recomeçar.
- Cada tentativa é registrada individualmente: bundle, artefatos, crítica, consumo, duração.
- Consumo do loop conta no orçamento da execução. Esgotado o orçamento **ou** o teto de
  `retries`, a etapa falha para decisão humana com todo o histórico anexado.
- Loop de crítica é modelado no workflow do motor, não dentro da activity: uma tentativa =
  uma activity. Laço dentro de activity perde a rastreabilidade e o cancelamento.

## 6. Gates humanos

- Gate é nó declarado no `flow.yaml`, com papel aprovador e política de expiração.
- No motor: espera por sinal externo com timeout longo. A execução fica parada por dias sem
  consumir recurso e sobrevive a reinício e deploy.
- O aprovador recebe o **diff** dos artefatos daquela etapa contra o commit base.
- Rejeição alimenta o loop de crítica com a justificativa humana como `critique.md`.
- Decisão registrada com aprovador, horário, commit e justificativa — imutável.
- Nenhum caminho de código pula gate. Gate ignorável não é gate.

## 7. Fronteira do motor — o que ela realmente entrega

A escolha do Temporal é **irreversível** no horizonte deste projeto
([ADR-002](../../../../docs/decisions/ADR-002-temporal-motor-de-fluxo.md)). A fronteira **não é
promessa de portabilidade**: o código de workflow e a modelagem de activity são específicos do
motor e vivem em `integrations/temporal/`, junto da implementação do `Protocol`
([`architecture.md`](architecture.md) §1). Trocar de motor reescreve essa camada.

O que a fronteira entrega, e que basta para justificá-la:

- **Testabilidade**: o domínio expõe `MotorDeExecucao` (`Protocol`) — iniciar execução, sinalizar
  gate, consultar estado, cancelar — e o serviço é testado contra um duplo em memória, sem subir
  Temporal.
- **Contenção**: tipo do Temporal (`WorkflowHandle`, `ActivityError`) não aparece em `service.py`.
  A restrição de determinismo de workflow fica confinada a um diretório, em vez de contaminar a
  regra de negócio.
- **Direção única de dependência**: regra de negócio, contrato de artefato e política de segurança
  nunca migram para o motor; durabilidade, retry e timeout nunca são reimplementados no domínio
  ([`orchestration.md`](orchestration.md) §1).

## 8. Tetos server-side: o contrato só pode reduzir

`network`, `mcp` e `limits` vêm de um arquivo em Git — o mesmo arquivo que um agente pode ser
induzido a propor alteração. Se o contrato fosse a palavra final, um PR de contrato seria escalação
de privilégio.

- O orquestrador mantém, na sua **configuração de servidor**, o teto de cada um: allowlist máxima
  de destinos de rede, conjunto máximo de MCP servers permitidos, teto máximo de tempo e de custo.
- O valor efetivo é `min(contrato, teto)`. Um contrato pode **reduzir** um limite; nunca ampliá-lo.
- Contrato que pede além do teto é **erro de carga**, não recorte silencioso — silêncio esconde a
  tentativa.
- A allowlist de MCP é por servidor identificado, não por padrão de nome.
- Verificador: teste que carrega contrato pedindo destino fora da allowlist do servidor, MCP não
  permitido e `limits` acima do teto, e verifica recusa nos três casos.

## 9. O `repo/` gravável nunca é o repositório do framework

O framework é o que define permissões, validadores, gates e tetos. Etapa que pudesse gravar nele
reescreveria as próprias regras — e a execução seguinte carregaria essas regras.

- O `repo/` montado gravável em uma etapa **não pode** ser o repositório do framework, nem um
  caminho dentro dele. Verificado na admissão da etapa, não por convenção.
- O framework chega à etapa como `context/`, somente leitura.
- Alteração de framework é um PR humano, sujeito ao linter de fluxo (§4) e ao review.

## 10. Commit dos artefatos: verify-then-write

Ao fim de uma etapa aprovada, o orquestrador — não a etapa — escreve na branch da execução.

- Só entram caminhos declarados em `outputs` do contrato. Arquivo produzido fora da lista é
  descartado e registrado.
- Antes de gravar: varredura de segredo sobre `out/` e sobre a branch
  ([`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §3). Achado falha a etapa.
- O commit é criado com **SHA determinístico**: autor, committer, data e mensagem derivados da
  execução e da tentativa, para que reexecutar a mesma tentativa produza o mesmo commit em vez de
  um histórico novo a cada retry.
- Escrita por repositório é serializada por **lock nomeado**, com o commit pai lido dentro do lock
  (verify-then-write). Duas etapas paralelas sobre o mesmo repositório não podem produzir
  sobrescrita silenciosa.
- **Nunca há merge automático para `main`.** A branch da execução é a entrega; a integração é
  decisão humana.

---

## Checklist

- [ ] Fluxo e contratos versionados em Git, em formato de diff revisável
- [ ] Execução fixa `framework@commit` e o mantém até o fim
- [ ] Agente novo entra por arquivo de contrato, sem redeploy
- [ ] Contrato com `limits`; campo desconhecido é erro de carga
- [ ] Linter de fluxo no CI **e** revalidação no carregamento
- [ ] Checagem semântica de entradas/saídas, ciclo, órfã e colisão de caminho
- [ ] `critique.md` com a saída literal dos validadores; tentativa recebe o produzido antes
- [ ] Uma tentativa = uma activity; loop modelado no workflow
- [ ] Teto de tentativas e orçamento respeitados; falha vai para humano com histórico
- [ ] Gate declarado, com diff, papel aprovador e decisão auditada imutável
- [ ] Motor atrás de `Protocol`; tipos do Temporal fora do domínio
