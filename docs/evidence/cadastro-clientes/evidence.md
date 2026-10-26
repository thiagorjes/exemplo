# Pacote de Evidências — cadastro-clientes

> Selado no release com hash. IDSD 4.10.
> **Gates:** GATE-EVIDENCIA, GATE-DADOS
>
> Este artefato é **cartório, não narrador**. Ele consolida registros que já
> foram escritos incrementalmente por cada etapa. Se um registro está ausente,
> a etapa correta é **falhar** — nunca reconstruir por memória ou inferência.

- **Release:** `cadastro-clientes-v1`
- **Selado em:** 2026-10-26
- **Hash do pacote:** não selado — ver "Registros ausentes" (1 registro faltante impede o selo, por desenho do `check_selo.py`/IDSD 4.10: nenhum registro ausente é reconstruído)
- **Flow executado:** `governance/flows/feature.yaml`
- **Classe:** feature, risco alto, impacto local (`docs/intent/cadastro-clientes-classification.md`)

---

## Conformidade de gates

| Gate | Exigido por | Evidência | Verificador | Resultado |
| --- | --- | --- | --- | --- |
| GATE-INTENT | núcleo da classe `feature` | `docs/intent/cadastro-clientes-intent.md` | `validate.py --mode output` (skill `intent`) | aprovado — Thiago Cavalcante, 2026-10-22 |
| GATE-CLASSIFY | núcleo inegociável | `docs/intent/cadastro-clientes-classification.md` | `validate.py --mode output` (skill `classify`) | aprovado — agente, 2026-10-22 |
| GATE-CONTEXT | núcleo inegociável | `docs/context/cadastro-clientes-context.md` | `validate.py --mode output` + `check_lacunas.py` | aprovado — agente, 2026-10-22 (0 lacunas bloqueantes) |
| GATE-DIRECAO | classe `feature` | `docs/shape/cadastro-clientes-brief.md` | `check_convergencia.py` | aprovado — Thiago Cavalcante, 2026-10-22 |
| GATE-SPEC | classe `feature` | `docs/prd/cadastro-clientes-prd.md` | `check_proveniencia.py` + `check_cenarios.py` | aprovado — Thiago Cavalcante, 2026-10-22 |
| GATE-PROVENIENCIA | classe `feature` | `docs/prd/cadastro-clientes-prd.md` (4 inferências confirmadas) | `check_proveniencia.py` | aprovado — Thiago Cavalcante, 2026-10-22 |
| GATE-CONSISTENCIA | classe `feature` | `docs/analyze/cadastro-clientes-analysis.md` | `validate.py --mode output` (skill `analyze`) | aprovado — agente, 2026-10-22 (0 bloqueantes; 4 achados menores corrigidos nos donos) |
| GATE-RASTREABILIDADE | classe `feature` | `docs/tasks/cadastro-clientes-tasks.md` | `check_cobertura.py` + `check_task_files.py` | aprovado — agente, 2026-10-22 |
| GATE-VERIFICACAO-INDEPENDENTE | núcleo inegociável | `docs/tests/cadastro-clientes-verificacao.md` | execução Red real (27/27 falhando por ausência de implementação) | aprovado — agente, 2026-10-22 |
| GATE-GHERKIN-CONGELADO | classe `feature` | `docs/tests/cadastro-clientes-verificacao.md` (Congelamento da suíte, 4 emendas nomeadas) | `check_congelamento.py` (rodado manualmente — pendência #09) | aprovado — agente, 2026-10-22 |
| GATE-REVISAO-TECNICA | classe `feature` | `docs/review/cadastro-clientes/completo-review.md` | `check_veredicto.py` (RNF à parte — ver abaixo) | aprovado — Thiago Cavalcante, 2026-10-26 (0 bloqueantes) |
| GATE-NFR | classe `feature` | `docs/review/cadastro-clientes/completo-review.md` + `governance/waivers/WAIVER-001-rnf-sem-instrumentacao.md` | `check_veredicto.py` — **reprova mecanicamente** (lacuna de ferramenta, pendência #13: não reconhece waiver de RNF) | aprovado por waiver — Thiago Cavalcante, 2026-10-26 |
| GATE-EVIDENCIA | núcleo inegociável | este documento | `validate.py --mode output` (skill `evidence`) | em selagem |
| GATE-DADOS | núcleo inegociável | ver "Verificação de dados sensíveis" abaixo | varredura manual | aprovado — 0 ocorrências |

- **Gates reprovados:** 0 (GATE-NFR reprova só na checagem mecânica, por lacuna conhecida da ferramenta — não bloqueia o selo, que é decidido pelo veredicto humano registrado)
- **Waivers aplicados:** [WAIVER-001](../../../governance/waivers/WAIVER-001-rnf-sem-instrumentacao.md) (GATE-NFR, RNF-001 a RNF-004)

## Versões

| Item | Versão | Hash |
| --- | --- | --- |
| Skills (`.agents/skills/`) | estado pós-rename `/context` → `/contexto` | commit `89f9bd7` (primeiro commit a incluir o estado final de `.agents/`; o rename em si aconteceu antes da inicialização do git neste diretório, sem histórico próprio) |
| Policies (`governance/policies/`) | inalteradas durante o flow | commit `89f9bd7` |
| Catálogo de gates (`governance/gates.yaml`) | inalterado durante o flow | commit `89f9bd7` |
| Modelo(s) de agente | Claude Sonnet 5 (`claude-sonnet-5-5` / variante `[1m]` conforme sessão) | — |

## Classificação e overrides

| Classificação final | Overrides | Reclassificações |
| --- | --- | --- |
| feature / risco alto / impacto local (`docs/intent/cadastro-clientes-classification.md`) | nenhum | nenhuma |

## Rastreabilidade

| RF | Cenário | Épico | Task | Commit (verde) |
| --- | --- | --- | --- | --- |
| RF-001 | SCN-001.1, SCN-001.2, SCN-001.3 | EPIC-01 | TASK-01.6 | `f626107` |
| RF-002 | SCN-002.1, SCN-002.2, SCN-002.3 | EPIC-02 | TASK-02.3 | `fd6d7fa` |
| RF-003 | SCN-003.1, SCN-003.2, SCN-003.3 | EPIC-02 | TASK-02.3 | `fd6d7fa` |
| RF-004 | SCN-004.1, SCN-004.2, SCN-004.3 | EPIC-03 | TASK-03.7 | `1b2c0c4` |
| RF-005 | SCN-005.1, SCN-005.2, SCN-005.3 | EPIC-03 | TASK-03.8 | `a1a875b` |
| RF-006 | SCN-006.1, SCN-006.2 | EPIC-04 | TASK-04.3 | `724ac19` |
| RF-006 | SCN-006.3 (integração) | EPIC-04 | TASK-04.1 | `5cc3228` |
| RF-007 | SCN-007.1, SCN-007.2, SCN-007.3 | EPIC-04 | TASK-04.4 | `67d50a8` |
| RF-008 | SCN-008.1, SCN-008.2, SCN-008.3 | EPIC-03 | TASK-03.6 | `57a49a9` |
| RF-009 | SCN-009.1, SCN-009.2 | EPIC-05 | TASK-05.3 | `23c0be0` |
| RF-009 | SCN-009.3 (integração) | EPIC-05 | TASK-05.1 | `a579d0e` |

> PR: não aplicável — entrega por commit direto em `main`, um commit por task (sem PR por épico, decisão operacional desta demo).

## Ordem de verificação

> Prova do GATE-VERIFICACAO-INDEPENDENTE: para cada cenário, o commit do teste
> precede o commit da implementação.

| Cenário | Commit do teste | Commit da implementação | Ordem correta |
| --- | --- | --- | --- |
| SCN-001.1 a SCN-009.3 (todos os 27) | `89f9bd7` (todos os `.feature`, specs e2e e testes Jest nasceram juntos, no primeiro commit de conteúdo) | ver tabela de Rastreabilidade acima (sempre posterior a `89f9bd7`) | sim, para os 27 |

## Resultados de cenário

| Cenário | Resultado | Execução | Data |
| --- | --- | --- | --- |
| SCN-001.1 a SCN-009.3 (27 cenários) | 27/27 passando (25 e2e Playwright headed + 3 Jest/Supertest) | `npm run test:e2e` (e2e) + `npm test` (backend), banco resetado do zero | 2026-10-26 |

## Envelopes de NFR

| RNF | Envelope declarado | Condição de medição | Medido | Dentro |
| --- | --- | --- | --- | --- |
| RNF-001 | p95 < 1s (demo, ~50 clientes) | observação manual na suíte e2e (TechSpec §7) | não | n/a — [WAIVER-001](../../../governance/waivers/WAIVER-001-rnf-sem-instrumentacao.md) |
| RNF-002 | sem SLA nesta entrega | — | não | n/a — WAIVER-001 |
| RNF-003 | sem retenção/expurgo nesta entrega | — | não | n/a — WAIVER-001 |
| RNF-004 | 1 admin + dezenas de usuários, sem meta de escala | — | não | n/a — WAIVER-001 |

## Achados de revisão

| # | Severidade | Onde | Status | Resolvido em |
| --- | --- | --- | --- | --- |
| ACH-01 | bloqueante (segurança) | CSRF ausente no BFF | fechado — implementado | commit `b4fdac2`, 2026-10-26 |
| ACH-02 | menor (código) | config morta (`SESSION_SECRET`/`SESSION_COOKIE_SECRET`) | fechado — removido | commit `eb2b50c`, 2026-10-26 |
| ACH-03 | menor (spec) | `contracts/usuario.md` divergia do código | fechado — doc alinhado | commit `eb2b50c`, 2026-10-26 |
| ACH-04 | relevante (NFR) | RNF-001 a RNF-004 sem waiver formal | fechado — waiver | [WAIVER-001](../../../governance/waivers/WAIVER-001-rnf-sem-instrumentacao.md), 2026-10-26 |

## Tentativas e custo

> `docs/tasks/cadastro-clientes/TASK-*.md` registra "Tentativas: 3" como orçamento por task, mas
> o campo de **tentativas efetivamente usadas** não foi preenchido de forma consistente em todas
> as 24 tasks — a maioria registra "tentativa 1 de 3" no histórico, e nenhuma esgotou o
> orçamento. Tokens e tempo por task não foram medidos individualmente durante a execução (a
> sessão não instrumentou isso por task). Registrado como lacuna abaixo, não reconstruído.

| Task | Tentativas usadas | Resultado final |
| --- | --- | --- |
| TASK-01.1 a TASK-01.5, TASK-02.1 a TASK-05.3 (23 tasks) | 1 de 3 (conforme histórico de cada arquivo) | concluída |
| TASK-01.1 | 2 (primeira tentativa bloqueada por Node 24 indisponível no ambiente — commit `e3852f3`; segunda concluiu — commit `70f136a`) | concluída |

## Intervenções humanas

| Data | Quem | Etapa | O que decidiu |
| --- | --- | --- | --- |
| 2026-10-22 | Thiago Cavalcante | `/intent` | Capturou e validou a intenção (resultado esperado, motivação, limites, fora de escopo, interface). |
| 2026-10-22 | Thiago Cavalcante | setup (`/guidelines`) | Escolheu stack: Next.js (frontend) + Node/Express (backend), decisões registradas em ADR-001 e SDR-001. |
| 2026-10-22 | Thiago Cavalcante | `/shape` | Convergiu os dois enquadramentos do discovery ("ambos"), definiu fronteira de escopo (login CPF+senha, CRUD de cliente PF/PJ, sem logs/auditoria/hierarquia), aprovou o Shape Brief (GATE-DIRECAO). |
| 2026-10-22 | Thiago Cavalcante | `/solution` (via `/techspec`, achado retroativo) | Decidiu adicionar ação de logout explícita (RF-009), não prevista no escopo original. |
| 2026-10-22 | Thiago Cavalcante | `/prd` | Decidiu as 4 opções em aberto do `/solution` (CPF/CNPJ duplicado bloqueia; senha mínimo 8 caracteres; exclusão definitiva; sessão expira em 5 min); aprovou o PRD (GATE-SPEC) e confirmou as 4 inferências de RNF (GATE-PROVENIENCIA). |
| 2026-10-22 | Thiago Cavalcante | `/techspec` | Decidiu reduzir o tempo de expiração de sessão para 30s no ambiente de e2e (`SESSION_IDLE_TIMEOUT_MS`), para a suíte headed não ficar arrastada. |
| 2026-10-23 | Thiago Cavalcante | `/implement` (EPIC-01) | Instruiu "não usar mais agentes para implementação" após o 1º incidente de integridade; aprovou a correção do cookie de sessão e a reaplicação da emenda de `01-login.spec.ts` com atribuição correta. |
| 2026-10-23 | Thiago Cavalcante | `/implement` (EPIC-02/03) | Reautorizou uso de agentes para `/implement`. |
| 2026-10-23 | Thiago Cavalcante | `/implement` (EPIC-04) | Aprovou a reaplicação de 2 emendas de locator (`getByRole('alert')`, `getByRole('cell')`) após o 2º incidente de integridade, com verificação técnica independente do coordenador. |
| 2026-10-23/26 | Thiago Cavalcante | `/implement` → `/code-review` | Autorizou seguir até finalizar a construção com decisões por conta do coordenador, avaliando só o resultado final. |
| 2026-10-26 | Thiago Cavalcante | `/code-review` | Aprovou via pergunta direta o waiver formal de GATE-NFR (WAIVER-001) para RNF-001 a RNF-004, após o 3º incidente de integridade (waivers fabricados, descartados antes de qualquer commit). |

## Verificação de dados sensíveis

- **Varredura executada:** 2026-10-26 (revisão manual dos dados de teste usados em fixtures, seeds e specs — `backend/.env.example`/`.env` com CPF de seed fixo `11111111111`, dados de cliente sintéticos como "Cliente A Excluir"/"Maria Silva Souza", CPFs/CNPJs gerados por `documentoUnico()` a partir de timestamp, não de pessoas reais)
- **Ocorrências de dado real de cliente:** 0

## Registros ausentes

| Registro esperado | Etapa que deveria ter escrito | Por que falta |
| --- | --- | --- |
| Tokens e tempo de execução por task individual | `/implement` | A sessão não instrumentou essa métrica por task; só o número de tentativas (sempre 1, exceto TASK-01.1 com 2) foi registrado de forma consistente no histórico de cada `TASK-*.md`. Não bloqueia o selo — não é um registro de gate, é detalhe operacional de custo. |

---

## Fora deste artefato — regras negativas

- **Reconstruir um registro que não existe.** É a proibição central. Ausência
  de registro é falha do pacote, não lacuna a preencher.
- **Resumir ou interpretar resultado.** Evidência transcreve; análise é de
  `/code-review` e `/analyze`.
- **Dado real de cliente**, em qualquer campo (IDSD 4.10.1). Referencie o
  identificador do registro, nunca o conteúdo.
- **Alterar qualquer artefato de origem.** O selo é somente leitura sobre o que
  já existe.
- **Dispensar gate.** Waiver é decisão humana registrada em governança; aqui
  apenas se cita o waiver aplicado.
