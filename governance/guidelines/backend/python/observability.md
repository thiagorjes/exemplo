# Observabilidade — Backend Python

> Condicional da coleção. Materializa [`../../_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md)
> e [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §7 com `structlog` +
> OpenTelemetry ([`stack.md`](stack.md)).

## 1. Logs

- `structlog` com renderer JSON em todo ambiente gerenciado; console colorido só em
  desenvolvimento local.
- Campos injetados por processor, não pelo autor da chamada: `timestamp` (ISO-8601 UTC), `level`,
  `logger`, `event`, `correlation_id`, `service`, `env`, `version`.
- Contexto de execução (`run_id`, `step_id`, `flow_id`, `attempt`) entra por `contextvars` no
  início da activity e acompanha tudo abaixo dela.
- Processor de **mascaramento** obrigatório no fim da cadeia, aplicado a toda linha. Não se
  confia no autor para lembrar de mascarar.
- Níveis conforme o transversal §1. `DEBUG` desligado em produção, ligável por identidade/run
  específico — nunca globalmente.

## 2. Métricas

Métricas mínimas, com rótulos `flow_id`, `step_id`, `runner`, `model`, `status`:

| Métrica | Tipo | Para quê |
|---|---|---|
| `run_iniciado_total` / `run_concluido_total` | Counter | Volume e taxa de sucesso de fluxo |
| `step_duracao_segundos` | Histogram | Latência por etapa; base do timeout |
| `step_tentativas_total` | Counter | Instabilidade de runner ou de provedor |
| `step_tokens_total` (entrada/saída) | Counter | Consumo |
| `step_custo_estimado` | Counter | Orçamento — é o número que aciona alerta financeiro |
| `container_ativos` | Gauge | Saturação do host |
| `container_orfaos_total` | Counter | Vazamento de limpeza — deve ser sempre zero |
| `artefato_invalido_total` | Counter | Quebra de contrato de etapa |
| `disco_livre_bytes` | Gauge | **O modo de falha real do host** ([`../../infra/docker/architecture.md`](../../infra/docker/architecture.md) §5.1) |
| `workspaces_ativos` | Gauge | Bundles em disco; divergir de `container_ativos` é vazamento |
| `tempo_preparo_etapa_segundos` | Histogram | Clone + bundle; separa custo de infra de custo de modelo |
| `egress_negado_total` | Counter | Destino fora da allowlist — sinal de injeção, não ruído |

Cardinalidade: **nunca** rotular por `run_id`, `user_id` ou caminho com identificador. Isso vai
para log e trace, não para métrica.

## 3. Tracing

- OpenTelemetry com instrumentação automática de FastAPI, SQLAlchemy e httpx.
- Span manual por etapa (`step.execute`), com atributos: `runner`, `runner_version`, `model`,
  `tokens_in`, `tokens_out`, `custo`, `tentativa`, `imagem`.
- Contexto de trace propagado API → Temporal → activity → chamadas de saída. Um run é lido como
  um trace só.
- Prompt e resposta **não** entram como atributo de span. Ficam no armazenamento de artefatos.
- Amostragem: 100% em erro e em run com falha; taxa reduzida no caminho feliz de alto volume.

## 4. Alertas

Alerta só sobre sintoma que exige ação humana:

| Condição | Severidade |
|---|---|
| Taxa de falha de run acima do limiar declarado por janela | Alta |
| Consumo acumulado ultrapassa percentual do orçamento do período | Alta |
| `container_orfaos_total` > 0 | Alta — é vazamento de custo e de credencial |
| Fila de activities crescendo de forma sustentada | Média |
| `artefato_invalido_total` subindo | Média — contrato ou prompt quebrou |
| Worker sem heartbeat | Alta |
| `disco_livre_bytes` abaixo do limiar de admissão | Alta — abaixo dele a etapa é recusada na entrada |
| `container_ativos` alto de forma sustentada | Média — indica etapa travada ou limpeza falhando |
| `egress_negado_total` > 0 | Alta — tentativa de saída fora da allowlist |
| Backup sem sucesso mais recente que o RPO declarado | Alta — inclui falha de execução e backup envelhecido |

Alerta sem dono e sem ação documentada é removido. Alerta que dispara toda semana e é ignorado
já foi removido na prática — formalize.

## 5. Saúde e diagnóstico

- `/health/live` — processo respondendo. `/health/ready` — Postgres, Temporal e Docker
  alcançáveis ([`fastapi.md`](fastapi.md) §7).
- Toda resposta de erro carrega `correlationId`; ele é suficiente para recuperar log, trace e
  artefatos do run.
- Log do runner é anexado ao run como artefato de diagnóstico, mascarado, com retenção declarada
  e controle de acesso próprio.

---

## Checklist

- [ ] Log JSON com campos e contexto injetados por processor
- [ ] Processor de mascaramento no fim da cadeia
- [ ] Métricas mínimas presentes; sem rótulo de alta cardinalidade
- [ ] Span por etapa com atributos de runner, modelo e consumo
- [ ] Prompt/resposta fora de log e de span
- [ ] Trace contínuo API → activity → saída
- [ ] Alertas com dono e ação; `container_orfaos_total` monitorado
- [ ] `/health/ready` verifica dependências reais
- [ ] `correlationId` recupera log, trace e artefatos
