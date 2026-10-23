# Contexto — cadastro-clientes

> Artefato de Controle. Monta o contexto mínimo de cada etapa e **registra
> lacuna como evidência em vez de inferir**.
> IDSD 4.6 — **Gate:** GATE-CONTEXT

- **Data:** 2026-10-22
- **Etapa alvo:** /tests

---

## Contexto resolvido

| Item | Fonte | Trecho relevante | Confiança |
| --- | --- | --- | --- |
| Resultado esperado, motivação, limites, fora de escopo, interface | `docs/intent/cadastro-clientes-intent.md` | Cadastro de pessoas para abertura de conta corrente, com login e dois papéis (admin global / usuário); usuários não entram na lista de clientes cadastrados | alta |
| Classificação da demanda | `docs/intent/cadastro-clientes-classification.md` | Tipo feature, risco alto (autenticação + dado pessoal), impacto local, flow `feature.yaml` | alta |
| Coleções de guidelines que regem o sistema | `guidelines.yaml` | `frontend/nextjs`, `backend/node` | alta |
| Stack backend é desvio da stack padrão (Java/Spring) para fins de demo IDSD | `docs/decisions/ADR-001-backend-node-para-demo-idsd.md` | Node 24 + Express aceito como exceção, sem infra corporativa completa | alta |
| Autenticação simplificada, sem RH-SSO real | `docs/decisions/SDR-001-autenticacao-simplificada-sem-rhsso.md` | Login próprio da aplicação, não integrado ao provedor corporativo de identidade | alta |
| Ferramenta e2e: Playwright, execução headed por padrão | `docs/decisions/ADR-002-playwright-e2e-visual.md` | Decisão explícita do demandante — suíte deve rodar visualmente, não só headless | alta |
| SPA com BFF obrigatório (sessão por cookie, CSRF, CSP) | `governance/guidelines/frontend/_shared/spa-bff.md` | Contrato de segurança para qualquer frontend SPA do workspace, aplicável ao Next.js | alta |
| Cenários congelados a verificar (9 RFs, 27 cenários) | `docs/prd/cadastro-clientes-prd.md` + `docs/prd/cadastro-clientes/*.feature` | RF-001 a RF-009, GATE-SPEC aprovado por Thiago Cavalcante em 2026-10-22 | alta |
| Contratos de API e modelo de dados | `docs/techspec/cadastro-clientes-techspec.md`, `docs/techspec/cadastro-clientes/data-model.md`, `docs/techspec/cadastro-clientes/contracts/*.md` | Rotas `/v1/sessoes`, `/v1/usuarios`, `/v1/clientes`; tabelas `usuarios`, `clientes`, `socios`, `sessoes` | alta |
| Telas e protótipos navegáveis | `docs/design/cadastro-clientes/screen-map.md`, `docs/design/cadastro-clientes/prototypes/*.html` | T1 Login, T2 Gestão de usuários, T3 Lista de clientes, T4 Incluir/editar cliente, T5 Confirmar exclusão | alta |
| Setup local (como subir backend e frontend para rodar e2e) | `docs/techspec/cadastro-clientes/quickstart.md` | `npm install`, `npm run migrate`, `npm run seed`, `npm run dev`/`npm start` | alta |

## Lacunas

> A parte mais importante deste artefato. Lacuna registrada é evidência;
> lacuna preenchida por inferência é violação.

| # | O que falta | Quem sabe | Bloqueia qual etapa | Status |
| --- | --- | --- | --- | --- |
| 1 | Quais são, exatamente, os "dados mínimos" de pessoa física/jurídica exigidos para abertura de conta corrente | Thiago Cavalcante (demandante) | /prd | resolvida — `docs/shape/cadastro-clientes-brief.md`, Fronteira de escopo |
| 2 | Volume esperado de admins/usuários | Thiago Cavalcante (demandante) | /shape | resolvida — sem meta de escala além de "1 admin global + dezenas de usuários" (RNF-004 do PRD, confirmado pelo demandante) |
| 3 | O que o admin global pode fazer além de cadastrar usuários | Thiago Cavalcante (demandante) | /solution | resolvida — criar usuário e visualizar lista somente leitura; editar/desativar fica fora de escopo (`docs/shape/cadastro-clientes-brief.md`, Fronteira de escopo) |
| 4 | `docs/tasks/cadastro-clientes-tasks.md` e os `TASK-*.md` ainda não existiam | ninguém — era trabalho em andamento, não informação faltante | /tests | resolvida — `/tasks` concluído em 2026-10-22, GATE-RASTREABILIDADE satisfeito (5 épicos, 24 tasks, `check_cobertura.py` e `validate.py` exit 0) |

- **Lacunas bloqueantes em aberto:** 0
  <!-- Todas as lacunas desta cadeia (#1-#4) estão resolvidas. /tests pode iniciar. -->

## Suposições operacionais

> Só para lacunas **não bloqueantes** que a etapa pode atravessar assumindo algo.
> Cada suposição precisa de um dono e de um momento de confirmação.

| # | Suposição | Se estiver errada | Dono | Confirmar até |
| --- | --- | --- | --- | --- |
| 1 | Existe um único papel "admin global" (sem hierarquia entre admins) nesta primeira versão | `/solution` precisaria modelar hierarquia de admins | Thiago Cavalcante | confirmada — fronteira de escopo aprovada em `/shape` não prevê hierarquia |

## Sistemas e artefatos em jogo

| Sistema | Papel nesta execução | Guidelines |
| --- | --- | --- |
| cadastro-clientes (este sistema, greenfield) | Sistema sendo criado: tela de login + cadastro de clientes | `frontend/nextjs`, `backend/node` |

---

## Fora deste artefato — regras negativas

- **Resposta inventada para uma lacuna.** Se o agente não tem fonte, o campo é
  lacuna. Preencher por plausibilidade é a violação exata que a 4.6 proíbe.
- **Decisão de qualquer tipo.** Este artefato reúne insumo; quem decide é
  `/shape`, `/prd` ou `/techspec`.
- **Requisito, regra de negócio ou cenário** → `/prd`.
- **Resumo do domínio escrito pelo agente sem citar fonte.** Se não dá para
  apontar de onde veio, não entra.
- **Dado real de cliente.** Nunca, em nenhum campo (IDSD 4.10.1). Use
  referência ao registro, não o conteúdo.
