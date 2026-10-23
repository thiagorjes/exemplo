### TASK-01.1 — Scaffolding do backend Node [api]

- **Status:** concluída
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** nenhuma
- **Cenários cobertos:** SCN-001.1
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §1, §5; `governance/guidelines/backend/node/stack.md`, `architecture.md` §2 e §5

#### Contexto

Antes de qualquer domínio de negócio, o backend precisa da estrutura de pastas, config
tipada, conexão SQLite e tratamento de erro central definidos em
`governance/guidelines/backend/node/architecture.md`. É o alicerce que as próximas tasks
deste épico (migrations, domínio sessão) e dos épicos seguintes (usuário, cliente) usam sem
recriar nada.

#### O que deve ser feito

- [ ] Criar `backend/package.json` com as dependências e versões exatas de
      `governance/guidelines/backend/node/stack.md`: `express@5.1.0`, `zod@4.0.0`,
      `pino@9.6.0`, `typescript@5.9.2` (dev); `jest@29.7.0`, `ts-jest@29.2.5`,
      `supertest@7.0.0` (dev) — não escrever os testes agora, só declarar a dependência
- [ ] Criar `backend/tsconfig.json` com `"strict": true`
- [ ] Criar `backend/.nvmrc` com o conteúdo `24.22.1`
- [ ] Criar `backend/src/config/index.ts`: lê e valida (Zod) no startup as variáveis `PORT`,
      `DATABASE_PATH`, `SESSION_SECRET`; processo encerra com mensagem listando o nome de
      cada variável ausente
- [ ] Criar `backend/src/db/connection.ts`: abre uma única `DatabaseSync` (`node:sqlite`) no
      caminho de `DATABASE_PATH`, reusada por todos os repositories (sem pool — decisão já
      registrada em `architecture.md` §4)
- [ ] Criar `backend/src/core/errors.ts` com as classes nomeadas: `RegraNegocioError`,
      `RecursoNaoEncontradoError`, `ConflitoError` — cada uma com `status` (HTTP) e
      `codigoRegra` opcional no construtor
- [ ] Criar `backend/src/middlewares/error-handler.ts`: handler global do Express que
      traduz as classes de `core/errors.ts` em corpo `application/problem+json` (`type`,
      `title`, `status`, `detail`, `codigoRegra` se houver, `traceId` do `X-Correlation-Id`)
- [ ] Criar `backend/src/middlewares/request-id.ts`: gera um `X-Correlation-Id` (UUID) se
      ausente no request, propaga na resposta e disponibiliza para o logger
- [ ] Criar `backend/src/app.ts`: monta o Express app (sem `app.listen`, para ser importável
      em teste) com os middlewares acima
- [ ] Criar `backend/src/server.ts`: único ponto que chama `app.listen(PORT)`
- [ ] Criar `backend/.env.example` documentando `PORT`, `DATABASE_PATH`, `SESSION_SECRET`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/package.json` | criar | dependências e versões exatas acima |
| `backend/package-lock.json` | criar | gerado por `npm install`, não editado à mão |
| `backend/tsconfig.json` | criar | `strict: true` |
| `backend/.nvmrc` | criar | `24.22.1` |
| `backend/src/config/index.ts` | criar | config tipada validada no startup |
| `backend/src/db/connection.ts` | criar | `DatabaseSync` única |
| `backend/src/core/errors.ts` | criar | `RegraNegocioError`, `RecursoNaoEncontradoError`, `ConflitoError` |
| `backend/src/middlewares/error-handler.ts` | criar | corpo `application/problem+json` |
| `backend/src/middlewares/request-id.ts` | criar | `X-Correlation-Id` |
| `backend/src/app.ts` | criar | monta o Express app |
| `backend/src/server.ts` | criar | `app.listen(PORT)` |
| `backend/.env.example` | criar | `PORT`, `DATABASE_PATH`, `SESSION_SECRET` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, qualquer arquivo em
`backend/test/` (specs e os passos de verificação vêm do `/tests`, que ainda não rodou).

#### Guia técnico — padrão a seguir

Referência viva: `governance/guidelines/backend/node/architecture.md` (estrutura de pastas,
§2; erros nomeados e handler global, §5). Como é o primeiro código deste sistema
(greenfield), não há arquivo análogo no repositório ainda — a árvore de pastas do
`architecture.md` é o padrão literal a copiar, não uma inspiração.

#### Guia técnico — pontos de atenção

- `node:sqlite` é nativo do Node 24, usado em modo experimental — por isso a versão exata
  `24.22.1` precisa estar fixada no `.nvmrc` (decisão já registrada em
  `governance/guidelines/backend/node/stack.md`, "Por que `node:sqlite`"); não substituir por
  `better-sqlite3`.
- `error-handler.ts` é o **único** lugar que monta o corpo `problem+json` — nenhuma rota
  monta esse corpo diretamente.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `cd backend && npm install && npx tsc --noEmit` roda sem erro de tipo | execução manual |
| 2 | `node` consegue importar `backend/src/app.ts` sem lançar exceção, mesmo sem `server.ts` rodar `listen` | execução manual (`node -e "require('./dist/app')"` após build) |
| 3 | Removendo uma variável do `.env` antes de subir, o processo encerra com mensagem citando o nome da variável ausente | execução manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`, a partir de `docs/techspec/cadastro-clientes-techspec.md` e `governance/guidelines/backend/node/architecture.md`. |
| 2026-10-23 | bloqueio (tentativa 1 de 3) | Ambiente de execução tinha Node **20.20.2** (sem `node:sqlite`, exige Node ≥22 experimental / 24 estável). `nvm install 24.9.0` e `nvm install 24.22.1` falharam — download de `nodejs.org` bloqueado pela rede (curl a `nodejs.org` e `registry.npmjs.org` diretos: erro SSL/timeout). Único canal de rede liberado: o mirror npm corporativo (`https://nexus3-cicd-tools.cloud.sfb/repository/npm-public/`, confirmado com `npm ping`) e `github.com` (200 OK, inclusive `git push` já funcionou nesta sessão). Não troquei a stack por conta própria — `stack.md` veda `better-sqlite3` explicitamente e essa é uma decisão de arquitetura (ADR-001/stack.md), não algo que `/implement` decide sozinho. Parando e escalando para o coordenador decidir. Nenhum arquivo de produção criado ainda — escopo integralmente intocado. |
| 2026-10-23 | concluída (tentativa 2 de 3) | Usuário instalou Node 24.22.1 (nvm-windows) e atualizou `governance/guidelines/backend/node/stack.md` (24.9.0 → 24.22.1, versão realmente disponível). Confirmado `node:sqlite` funcional. Implementado o scaffolding completo: `package.json`/`package-lock.json`, `tsconfig.json`, `.nvmrc` (24.22.1), `.env.example`, `src/config/index.ts` (Zod), `src/db/connection.ts` (`DatabaseSync`, cria diretório pai se ausente), `src/core/errors.ts`, `src/middlewares/{error-handler,request-id}.ts`, `src/app.ts`, `src/server.ts`. Ajuste fora do previsto na task: `start`/`dev` usam `node --env-file=.env` (nativo do Node 24) em vez de uma dependência `dotenv`, que a task não listava. Tabela de arquivos corrigida para incluir `package-lock.json` (gerado pelo `npm install`, `check_escopo.py` não reconhecia). Critérios de aceite 1-3 confirmados manualmente. `check_escopo.py --base HEAD` → exit 0. |
