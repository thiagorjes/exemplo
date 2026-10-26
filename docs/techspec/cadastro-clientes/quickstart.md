# Quickstart — cadastro-clientes

> O que `/implement` lê antes de codificar. Stack, estrutura, setup, um exemplo por RF.

## Stack

- **Backend (core):** Node 24 LTS + Express 5.1.0 + TypeScript 5.9.2 + Zod 4.0.0 + `node:sqlite`
  + Pino 9.6.0 (`governance/guidelines/backend/node/`)
- **Frontend (BFF + SPA):** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 3.4 +
  Radix/shadcn (`governance/guidelines/frontend/nextjs/`)
- **e2e:** Playwright, modo headed por padrão (ADR-002)
- **Testes backend:** Jest + Supertest (`governance/guidelines/backend/node/testing.md`)

## Estrutura de pastas

```
backend/                          (API Node — "core")
  src/
    config/ core/
    usuario/   {routes,service,repository,model}.ts
    cliente/   {routes,service,repository,model}.ts
    sessao/    {routes,service,repository,model}.ts
    middlewares/{error-handler,request-id}.ts
    db/{connection.ts, migrations/}
    app.ts
  src/server.ts
  test/

frontend/                         (Next.js — BFF + SPA)
  src/app/
    (public)/login/
    (protected)/
      usuarios/
      clientes/
        novo/ [id]/editar/
    api/
      sessoes/route.ts            → proxy para POST/DELETE /v1/sessoes no core
      usuarios/route.ts           → proxy para POST/GET /v1/usuarios
      clientes/route.ts e [id]/route.ts → proxy para /v1/clientes
    health/
  src/proxy.ts                    (cookie __Host-, 401 → /login)
  src/routes/ src/schemas/ src/lib/

e2e/                               (Playwright, na raiz ou em frontend/ — decisão de /tasks)
  tests/*.spec.ts
  playwright.config.ts
```

## Setup mínimo

```bash
# Backend
cd backend && npm install
cp .env.example .env            # PORT, DATABASE_PATH, SESSION_IDLE_TIMEOUT_MS
npm run migrate                 # aplica src/db/migrations/*.sql
npm run seed                    # cria o primeiro admin_global (único jeito de obter o 1º usuário)
npm run dev                     # sobe em PORT (ex. 3001)
# Para rodar o e2e: suba o backend com SESSION_IDLE_TIMEOUT_MS=30000 (30s) em vez do padrão
# 300000 (5min) — decisão do demandante em 2026-10-22 para a suíte headed não ficar arrastada.

# Frontend
cd frontend && npm install
cp .env.example .env.local      # API_GATEWAY_URL=http://localhost:3001
npm run dev                     # sobe em 3000, consome o backend via app/api/*

# e2e (depois dos dois acima rodando)
cd e2e && npm install
npx playwright install
npm run test:e2e                # headed por padrão (ADR-002)
npm run test:e2e:headless       # variante para CI
```

## Um cenário por RF (exemplo executável contra a API core, via curl)

**RF-001 — Login:**
```bash
curl -i -X POST localhost:3001/v1/sessoes -H 'Content-Type: application/json' \
  -d '{"cpf":"11111111111","senha":"senha123"}'
```

**RF-002 — Admin global cria usuário** (precisa do `id` da sessão do passo anterior, enviado
pelo BFF como cookie — direto na API core o teste injeta o header interno que o BFF usaria):
```bash
curl -i -X POST localhost:3001/v1/usuarios -H 'Content-Type: application/json' \
  -H 'X-Sessao-Id: <id-da-sessao-admin>' -d '{"cpf":"22222222222","senha":"outrasenha"}'
```

**RF-003 — Listar usuários:**
```bash
curl -i localhost:3001/v1/usuarios -H 'X-Sessao-Id: <id-da-sessao-admin>'
```

**RF-004 — Incluir cliente PF:**
```bash
curl -i -X POST localhost:3001/v1/clientes -H 'Content-Type: application/json' \
  -H 'X-Sessao-Id: <id-da-sessao-usuario>' \
  -d '{"tipo":"PF","documento":"33333333333","nomeCompleto":"Maria Silva","dataNascimento":"1990-01-01","endereco":"Rua A, 123","telefone":"27999999999"}'
```

**RF-005 — Incluir cliente PJ com sócio:**
```bash
curl -i -X POST localhost:3001/v1/clientes -H 'Content-Type: application/json' \
  -H 'X-Sessao-Id: <id-da-sessao-usuario>' \
  -d '{"tipo":"PJ","documento":"11222333000181","nomeFantasia":"Padaria Boa","razaoSocial":"Padaria Boa LTDA","dataAbertura":"2020-01-01","endereco":"Rua B, 45","telefone":"27988888888","socios":[{"nomeCompleto":"João Souza","cpf":"44444444444"}]}'
```

**RF-006 — Editar cliente:**
```bash
curl -i -X PUT localhost:3001/v1/clientes/<id> -H 'Content-Type: application/json' \
  -H 'X-Sessao-Id: <id-da-sessao-usuario>' -d '{"tipo":"PF","documento":"33333333333","nomeCompleto":"Maria Silva Souza","dataNascimento":"1990-01-01","endereco":"Rua A, 123","telefone":"27999999999"}'
```

**RF-007 — Excluir cliente:**
```bash
curl -i -X DELETE localhost:3001/v1/clientes/<id> -H 'X-Sessao-Id: <id-da-sessao-usuario>'
```

**RF-008 — Listar clientes:**
```bash
curl -i localhost:3001/v1/clientes -H 'X-Sessao-Id: <id-da-sessao-usuario>'
```

**RF-009 — Logout:**
```bash
curl -i -X DELETE localhost:3001/v1/sessoes/<id-da-sessao>
```

> `X-Sessao-Id` acima é só para testar a API core isoladamente. Pelo BFF Next.js, a sessão
> viaja no cookie `__Host-sessao` — o browser/Playwright nunca manda esse header diretamente.

## Pontos de atenção para `/implement`

- O `papel` de uma sessão só é conferido no core (`GET /v1/sessoes/{id}` devolve `papel`); o BFF
  não decide autorização sozinho, só repassa.
- `excluido_em` é a única forma de distinguir 404 de 410 em `/v1/clientes/{id}` — não implementar
  `DELETE` físico.
- Seed do primeiro `admin_global` é script separado das migrations (`npm run seed`), não dado de
  migration — ver `data-model.md`, "Seed inicial".
- Pendência registrada (não bloqueante): protótipos T1–T5 não têm o elemento de logout
  desenhado — ao implementar a navbar autenticada, adicionar a ação sem reabrir `/design`.
- Suíte Playwright: configurar `headless: false` como padrão do `playwright.config.ts` (ADR-002)
  — é o que esta demo existe para provar.
