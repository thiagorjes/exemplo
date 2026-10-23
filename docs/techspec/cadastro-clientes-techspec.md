# TechSpec — cadastro-clientes
_Versão: 1.0 | Status: Draft | Data: 2026-10-22 | Autor: agente (flow IDSD)_
_PRD: docs/prd/cadastro-clientes-prd.md v1.0_

---

## 1. Visão Geral Técnica

Sistema de demonstração do flow IDSD: cadastro de clientes (PF/PJ) para abertura de conta
corrente, com login e dois papéis (admin global, usuário). Substitui o processo atual em
planilha + drive compartilhado por um formulário estruturado e validado, atrás de login
obrigatório.

**Sistemas afetados:** nenhum além deste (sistema novo, greenfield, impacto local conforme
`/classify`).

**Abordagem:** Next.js (App Router) como BFF — único ponto que fala com a API core — mais uma
API Node/Express isolada que concentra toda a regra de negócio e persistência (SQLite em
arquivo). Sem integração com sistema externo. Essa divisão já é o padrão das coleções
declaradas em `guidelines.yaml` (`frontend/nextjs` + `backend/node`); esta feature não desvia
dele (confirmado com o coordenador em `/techspec`, Bloco A).

**Limitação de guidelines:** a coleção `backend/node` é uma stack de exceção, registrada só
para esta demonstração (ver [ADR-001](../decisions/ADR-001-backend-node-para-demo-idsd.md));
a coleção `frontend/nextjs` não cobre e2e de navegador, lacuna coberta por
[ADR-002](../decisions/ADR-002-playwright-e2e-visual.md) nesta própria TechSpec.

---

## 2. Decisões Arquiteturais

> Decisões: ADR-001 (herdada do `/guidelines`), SDR-001 (herdada do `/guidelines`), ADR-002
> (nova, desta TechSpec)

| ADR | Decisão | Impacto |
|-----|---------|---------|
| [ADR-001](../decisions/ADR-001-backend-node-para-demo-idsd.md) | Backend em Node/Express, exceção à stack padrão (Java) | Toda a API core usa a coleção `backend/node` (Express, Zod, `node:sqlite`, Pino) em vez de Spring Boot |
| [SDR-001](../decisions/SDR-001-autenticacao-simplificada-sem-rhsso.md) | Autenticação própria da aplicação, sem RH-SSO | Login por CPF + senha contra a própria API core; sessão por id opaco, não OIDC/JWT; o contrato de `frontend/_shared/spa-bff.md` é cumprido só nas partes agnósticas de OIDC (cookie, CSRF, 401→login) |
| [ADR-002](../decisions/ADR-002-playwright-e2e-visual.md) | Playwright como ferramenta de e2e, headed por padrão | Suíte e2e (próxima etapa `/tests`) roda visível por padrão; `frontend/nextjs/testing.md` ganha uma lacuna a preencher se outro sistema vier a reaproveitar |

---

## 3. Modelo de Dados

→ Documento completo: [cadastro-clientes/data-model.md](cadastro-clientes/data-model.md)

**Entidades principais:**

| Entidade | Atributos-chave | Relacionamentos |
|----------|----------------|----------------|
| `usuarios` | `id`, `cpf` (único), `senha_hash`, `papel` (`admin_global`\|`usuario`) | 1:N com `sessoes` |
| `clientes` | `id`, `tipo` (`PF`\|`PJ`), `documento` (único), campos específicos de cada tipo, `excluido_em` | 1:N com `socios` (só quando `tipo='PJ'`) |
| `socios` | `id`, `cliente_id`, `nome_completo`, `cpf` | N:1 com `clientes` |
| `sessoes` | `id` (opaco), `usuario_id`, `ultima_atividade_em`, `encerrada_em` | N:1 com `usuarios` |

Decisões de modelagem (tabela única `clientes` com discriminador; exclusão lógica apesar de
"definitiva" no produto) estão documentadas e justificadas no `data-model.md`.

---

## 4. Contratos de API / Interface

→ Documentos completos: [cadastro-clientes/contracts/](cadastro-clientes/contracts/)

### Sessão (login/logout) — [`contracts/sessao.md`](cadastro-clientes/contracts/sessao.md)

**Tipo:** REST

**Contrato:**
- Entrada: CPF + senha (login); id de sessão (validar/logout)
- Saída: id de sessão opaco + papel; `204` no logout
- Erros: `400` (formato), `401` (credencial inválida ou sessão inválida/expirada)

### Usuário (criar/listar) — [`contracts/usuario.md`](cadastro-clientes/contracts/usuario.md)

**Tipo:** REST

**Contrato:**
- Entrada: CPF + senha (criar)
- Saída: usuário criado sem senha/hash; lista de usuários
- Erros: `400` (senha curta, CPF inválido), `403` (sem papel admin_global), `409` (CPF duplicado)

### Cliente (CRUD + listagem) — [`contracts/cliente.md`](cadastro-clientes/contracts/cliente.md)

**Tipo:** REST

**Contrato:**
- Entrada: dados PF ou PJ (com sócios, se PJ)
- Saída: cliente criado/atualizado; lista de clientes ativos
- Erros: `400` (campo obrigatório vazio, sócio ausente em PJ), `404`/`410` (inexistente vs.
  excluído), `409` (documento duplicado)

---

## 5. Arquitetura e Fluxo

```
┌──────────┐      ┌───────────────────────────┐      ┌─────────────────────┐
│ Browser  │──────▶ Next.js (BFF + SPA)        │──────▶ API Node (core)     │
│ (Play-   │ cookie│ app/(public)/login         │ HTTP  │ /v1/sessoes        │
│ wright)  │ __Host│ app/(protected)/usuarios   │ 127.0.│ /v1/usuarios       │
│          │◀──────│ app/(protected)/clientes   │0.0.1  │ /v1/clientes       │
│          │ 401→  │ app/api/* (proxy)          │──────▶│ SQLite (data/app.db)│
└──────────┘ /login└───────────────────────────┘      └─────────────────────┘
```

**Fluxo principal (login → cadastro de cliente):**
1. Browser envia CPF+senha para `app/api/sessoes` (route handler, BFF).
2. BFF chama `POST /v1/sessoes` na API core; recebe `id` de sessão.
3. BFF seta cookie `__Host-sessao` (`HttpOnly`, `Secure`, `SameSite=Strict`) com esse `id` e
   redireciona para `/clientes` (usuário) ou `/usuarios` (admin global), conforme `papel`.
4. Toda navegação protegida seguinte: `proxy.ts` lê o cookie, chama `GET /v1/sessoes/{id}` na
   API core para validar/renovar; `401` → limpa cookie e redireciona para `/login`.
5. Em `/clientes/novo`, o formulário (React Hook Form + Zod) envia para `app/api/clientes`
   (BFF), que repassa para `POST /v1/clientes` na API core com o `X-Correlation-Id` propagado.
6. API core valida (Zod), aplica as regras RN-005 a RN-011, grava no SQLite, devolve `201`.
7. BFF repassa o `201` (ou erro Problem Details traduzido) para o browser.

---

## 6. Dependências Inter-Sistemas

| Sistema | Interface | Status | Mock? |
|---------|-----------|--------|-------|
| — | — | Nenhuma dependência inter-sistemas — feature isolada, classificada como impacto local em `/classify` | Não |

---

## 7. Estratégia de Testes

| Tipo | Ferramenta | Cobertura alvo |
|------|-----------|----------------|
| Unitário (backend) | Jest (`backend/node/testing.md`) | `service` de cada domínio (`usuario`, `cliente`, `sessao`) — regra de negócio isolada, > 80% |
| Integração (backend) | Jest + Supertest | Toda rota `routes.ts` — contrato HTTP campo a campo, sucesso e cada erro nomeado |
| Integração (backend, repository) | Jest + `node:sqlite` em `:memory:` | Constraints reais do SQLite (`UNIQUE`, `NOT NULL`, FK) |
| Unitário/componente (frontend) | Jest + Testing Library (`frontend/nextjs/testing.md`) | Schemas Zod de formulário; route handlers (`app/api/*`) mockando a API core |
| **E2E** | **Playwright, headed por padrão ([ADR-002](../decisions/ADR-002-playwright-e2e-visual.md))** | Todo cenário do PRD marcado `e2e` — login, criação de usuário, CRUD de cliente PF/PJ, logout |

**Decisão explícita (objetivo desta demonstração):** a suíte Playwright roda com navegador
visível (`headless: false`) como configuração padrão deste projeto — é o que prova, de forma
observável, que o flow IDSD produziu um sistema funcional. Uma configuração headless equivalente
fica disponível para uso futuro em CI, mas não é o modo "padrão" desta entrega.

A escrita dos testes (step definitions, specs Playwright) é escopo da próxima etapa (`/tests`),
não desta TechSpec — aqui só a estratégia e a ferramenta estão decididas.

---

## 8. Segurança e Observabilidade

**Segurança:**
- Senha: hash `scrypt` (`node:crypto`), nunca texto plano, nunca logada, nunca devolvida em
  nenhuma resposta (RN-003; `backend/node/architecture.md` §5).
- Sessão: id opaco (`crypto.randomBytes(32)`), nunca JWT local (SDR-001). Expira por inatividade
  (RN-004), verificado em `GET /v1/sessoes/{id}`. Período configurável via `SESSION_IDLE_TIMEOUT_MS`
  (padrão **300000**, 5 minutos — é o valor de RN-004); ambiente de e2e roda com **30000** (30s),
  decisão do demandante em 2026-10-22 para a suíte headed não ficar arrastada. O número não é
  hardcoded no `service` — lido da config tipada no startup (`backend/node/architecture.md` §3).
- Cookie `__Host-sessao`: `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, sem `Domain`
  (`frontend/_shared/spa-bff.md` §3) — emitido e lido só pelo BFF, nunca legível por JS no
  browser.
- CSRF: toda mutação (`POST`/`PUT`/`DELETE` via `app/api/*`) exige `X-XSRF-TOKEN` igual ao
  cookie `XSRF-TOKEN` (double-submit), conforme `spa-bff.md` §3 — não depende de RH-SSO, é
  agnóstico de provedor de identidade.
- `401` do core → BFF invalida o cookie e redireciona para `/login` (sem expor detalhe do
  upstream).
- Autorização: `papel` é conferido na API core (deny-by-default) em `/v1/usuarios`; o BFF nunca
  decide sozinho se uma ação é permitida, só repassa o que o core responde (RN-006).
- Dado pessoal (CPF, CNPJ, nome, endereço, telefone) nunca aparece em log — Pino configurado
  para nunca logar o corpo bruto das requisições de `cliente`/`usuario` (`_shared/logging-and-levels.md` §3,
  `backend/node/coding-standards.md`).

**Observabilidade:**
- Logs: Pino estruturado (JSON), `req.id` de `X-Correlation-Id` propagado do BFF ao core em todo
  log de request (`backend/node/architecture.md` §5).
- Métricas: nenhuma métrica formal nesta demo (sem Prometheus/Actuator — fora de escopo,
  `backend/node/definition-of-done.md`); observação de tempo de resposta do RNF-001 é feita
  manualmente durante a execução da suíte e2e, não por instrumentação de produção.

---

## 9. Matriz de Rastreabilidade

| RF/RNF | Implementado em | Validado por |
|--------|----------------|-------------|
| RF-001 | `sessao/{routes,service}.ts` (core); `app/(public)/login`, `app/api/sessoes/route.ts` (BFF) | SCN-001.1 a .3 (e2e, Playwright) |
| RF-002 | `usuario/{routes,service}.ts` (core); `app/(protected)/usuarios`, `app/api/usuarios/route.ts` | SCN-002.1 a .3 (e2e) |
| RF-003 | `usuario/{routes,service}.ts` (`GET`); `app/(protected)/usuarios` | SCN-003.1 a .3 (e2e) |
| RF-004 | `cliente/{routes,service}.ts` (`POST`, `tipo=PF`); `app/(protected)/clientes/novo` | SCN-004.1 a .3 (e2e) |
| RF-005 | `cliente/{routes,service}.ts` (`POST`, `tipo=PJ` + `socios`); `app/(protected)/clientes/novo` | SCN-005.1 a .3 (e2e) |
| RF-006 | `cliente/{routes,service}.ts` (`PUT`); `app/(protected)/clientes/[id]/editar` | SCN-006.1, .2 (e2e), SCN-006.3 (integração, Supertest) |
| RF-007 | `cliente/{routes,service}.ts` (`DELETE`); diálogo de confirmação em `app/(protected)/clientes` | SCN-007.1 a .3 (e2e) |
| RF-008 | `cliente/{routes,service}.ts` (`GET`); `app/(protected)/clientes` | SCN-008.1 a .3 (e2e) |
| RF-009 | `sessao/{routes,service}.ts` (`DELETE`); ação de logout na navbar autenticada (pendência visual — ver Seção 10) | SCN-009.1, .2 (e2e), SCN-009.3 (integração, Supertest) |
| RNF-001 | Toda a cadeia BFF → core → SQLite (sem camada adicional de cache/fila) | Observação manual de tempo de resposta durante a execução e2e |
| RNF-002 | N/A — sem meta de SLA nesta entrega | N/A (decisão registrada no PRD) |
| RNF-003 | N/A — sem política de retenção nesta entrega | N/A (decisão registrada no PRD) |
| RNF-004 | Schema sem particionamento/paginação (adequado a dezenas de registros) | N/A — não medido, volume de referência do PRD |

Verificado com `check_rf_coverage.py` — todos os 9 RFs do PRD aparecem nesta matriz.

---

## 10. Questões em Aberto

| # | Questão | Responsável | Prazo |
|---|---------|------------|-------|
| Q-001 | Protótipos T1–T5 não têm o elemento de logout desenhado (RF-009 foi adicionado depois da prototipagem) — resolver visualmente, sem reabrir `/design` por completo | `/implement` (ou revisão rápida de `/design`) | Antes de fechar a navbar autenticada |
| Q-002 | `backend/node/testing.md` e `frontend/nextjs/testing.md` não cobrem e2e Playwright — ADR-002 decide para esta feature, mas a coleção não foi atualizada | Dono da biblioteca de guidelines (`/guidelines --revisar`) | Se outro sistema vier a reaproveitar Playwright |
| Q-003 | Sem job de limpeza de sessões expiradas no banco (a expiração é só lógica, calculada na leitura) — linhas de `sessoes` se acumulam indefinidamente | `/implement` ou `/tasks` (item de manutenção, não bloqueante para esta demo) | Não bloqueante — volume de demo é pequeno |

---

## 11. Histórico de Revisões

| Versão | Data | Autor | Alteração |
|--------|------|-------|-----------|
| 1.0 | 2026-10-22 | agente (flow IDSD) | Versão inicial |

---

## Fora deste artefato — regras negativas

O que **não** entra aqui, e para onde vai:

| Conteúdo | Pertence a | Por quê |
|---|---|---|
| Requisito funcional ou não-funcional novo | `/prd` | não passou pelo gate de spec, não tem cenário nem procedência |
| Cenário Gherkin | `/prd` | congelado no gate de spec; reescrevê-lo aqui quebra a verificação independente |
| Task, épico, estimativa, sequenciamento | `/tasks` | plano de execução não é decisão de desenho |
| Dimensão do REASONS Canvas | derivado | o canvas é projetado das fontes por `derive_canvas.py` |
| Norma técnica de aplicação geral | `/guidelines` | se vale além desta feature, escrevê-la aqui a esconde dos outros sistemas |

Escopo novo descoberto durante a TechSpec **volta para o `/prd`** e consome uma
devolução. Resolver aqui é mais rápido e é justamente o que a matriz de
rastreabilidade não consegue detectar depois.
