# Tasks — cadastro-clientes
_Data: 2026-10-22 | Autor: agente (flow IDSD)_
_PRD: docs/prd/cadastro-clientes-prd.md_
_TechSpec: docs/techspec/cadastro-clientes-techspec.md_
_Cenários congelados: docs/prd/cadastro-clientes/*.feature_

> Este documento é o plano de execução. Ele não redefine requisito, não decide
> arquitetura e não escreve teste — só distribui, ordena e instrui.
> A camada de User Story não existe: o cenário Gherkin já é a narrativa e já
> está congelado como contrato.

---

## Princípios para tasks prontas para IA

Uma task está pronta quando quem a executa **não precisa abrir o PRD nem a
TechSpec para saber o que fazer**. Isso implica cópia integral, não referência:

- **Auto-contida.** Todo dado necessário está no arquivo da task — assinatura de
  método, nome de campo, mensagem de erro literal, modo de arredondamento.
  "Conforme a TechSpec §4.2" não é instrução, é adiamento.
- **Um resultado verificável.** Se a task tem dois resultados independentes, são
  duas tasks.
- **Sem decisão em aberto.** Task que começa com uma escolha a fazer é uma
  lacuna do `/techspec` que escapou do `/analyze` — devolva em vez de executar.
- **Escopo de arquivo declarado.** O que pode ser criado, o que pode ser
  alterado, e o que é proibido tocar.

---

## Sumário de épicos

| ID | Épico | Sistema | Cenários entregues | Tasks | Executor | Pode iniciar |
| --- | --- | --- | --- | --- | --- | --- |
| EPIC-01 | Fundação e login | api + web | SCN-001.1, SCN-001.2, SCN-001.3 | 6 | agente | imediatamente |
| EPIC-02 | Gestão de usuários | api + web | SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3 | 3 | agente | após EPIC-01 |
| EPIC-03 | Inclusão e listagem de clientes (PF e PJ) | api + web | SCN-004.1, SCN-004.2, SCN-004.3, SCN-005.1, SCN-005.2, SCN-005.3, SCN-008.1, SCN-008.2, SCN-008.3 | 8 | agente | após EPIC-01 |
| EPIC-04 | Edição e exclusão de clientes | api + web | SCN-006.1, SCN-006.2, SCN-006.3, SCN-007.1, SCN-007.2, SCN-007.3 | 4 | agente | após EPIC-03 |
| EPIC-05 | Logout | api + web | SCN-009.1, SCN-009.2, SCN-009.3 | 3 | agente | após EPIC-01 |

### Cobertura de cenários

| Cenário | RF | Épico | Tipo de teste |
| --- | --- | --- | --- |
| SCN-001.1 | RF-001 | EPIC-01 | e2e |
| SCN-001.2 | RF-001 | EPIC-01 | e2e |
| SCN-001.3 | RF-001 | EPIC-01 | e2e |
| SCN-002.1 | RF-002 | EPIC-02 | e2e |
| SCN-002.2 | RF-002 | EPIC-02 | e2e |
| SCN-002.3 | RF-002 | EPIC-02 | e2e |
| SCN-003.1 | RF-003 | EPIC-02 | e2e |
| SCN-003.2 | RF-003 | EPIC-02 | e2e |
| SCN-003.3 | RF-003 | EPIC-02 | e2e |
| SCN-004.1 | RF-004 | EPIC-03 | e2e |
| SCN-004.2 | RF-004 | EPIC-03 | e2e |
| SCN-004.3 | RF-004 | EPIC-03 | e2e |
| SCN-005.1 | RF-005 | EPIC-03 | e2e |
| SCN-005.2 | RF-005 | EPIC-03 | e2e |
| SCN-005.3 | RF-005 | EPIC-03 | e2e |
| SCN-006.1 | RF-006 | EPIC-04 | e2e |
| SCN-006.2 | RF-006 | EPIC-04 | e2e |
| SCN-006.3 | RF-006 | EPIC-04 | integração |
| SCN-007.1 | RF-007 | EPIC-04 | e2e |
| SCN-007.2 | RF-007 | EPIC-04 | e2e |
| SCN-007.3 | RF-007 | EPIC-04 | e2e |
| SCN-008.1 | RF-008 | EPIC-03 | e2e |
| SCN-008.2 | RF-008 | EPIC-03 | e2e |
| SCN-008.3 | RF-008 | EPIC-03 | e2e |
| SCN-009.1 | RF-009 | EPIC-05 | e2e |
| SCN-009.2 | RF-009 | EPIC-05 | e2e |
| SCN-009.3 | RF-009 | EPIC-05 | integração |

**Invariante de rastreabilidade:** os 27 cenários congelados (RF-001 a RF-009) aparecem cada
um em exatamente um épico; nenhum épico entrega zero cenários.

### Dimensionamento

| Épico | Tasks | Situação |
| --- | --- | --- |
| EPIC-01 | 6 | ok (≤ 8) |
| EPIC-02 | 3 | ok (≤ 8) |
| EPIC-03 | 8 | ok (≤ 8) |
| EPIC-04 | 4 | ok (≤ 8) |
| EPIC-05 | 3 | ok (≤ 8) |

Nenhum épico precisou de corte — todos ficaram dentro do alvo (≤ 8 tasks), sem necessidade de
aviso de dimensionamento.

---

## Grafo de dependências

```
EPIC-01 (fundação e login)
  ├── EPIC-02 (gestão de usuários)
  ├── EPIC-03 (inclusão e listagem de clientes)
  │     └── EPIC-04 (edição e exclusão de clientes)
  └── EPIC-05 (logout)
```

Épicos que podem correr em paralelo: **EPIC-02, EPIC-03 e EPIC-05**, assim que EPIC-01
terminar. EPIC-04 só pode começar depois de EPIC-03 (opera sobre o domínio `cliente` criado
lá). Dentro de cada épico, a ordem das tasks é serial — elas compartilham o mesmo PR.

---

## EPIC-01 — Fundação e login

- **Sistema:** api + web
- **Entrega:** SCN-001.1, SCN-001.2, SCN-001.3
- **Depende de:** nenhum
- **Fatia vertical:** ao final, uma pessoa com usuário criado pelo seed consegue abrir o
  browser, fazer login (CPF + senha) e ser redirecionada conforme o papel — é o primeiro
  cenário e2e inteiramente verificável de ponta a ponta (navegador → BFF Next.js → API Node →
  SQLite), e é onde entra o scaffolding mínimo de cada subsistema, porque sem ele nada roda.
- **Gate do épico:** PR aberto e SCN-001.1/.2/.3 passando.

### TASK-01.1 — Scaffolding do backend Node [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** nenhuma
- **Cenários cobertos:** SCN-001.1
- **Origem:** TechSpec §1, §5; `governance/guidelines/backend/node/stack.md`, `architecture.md` §2 e §5

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
- [ ] Criar `backend/.nvmrc` com o conteúdo `24.9.0`
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
| `backend/tsconfig.json` | criar | `strict: true` |
| `backend/.nvmrc` | criar | `24.9.0` |
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
  `24.9.0` precisa estar fixada no `.nvmrc` (decisão já registrada em
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

---

### TASK-01.2 — Migrations das 4 tabelas e seed do admin_global [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.1
- **Cenários cobertos:** SCN-001.1
- **Origem:** `docs/techspec/cadastro-clientes/data-model.md` ("Tabelas", "Migrations", "Seed inicial")

#### Contexto

As migrations criam o schema do qual todo domínio de negócio depende. O seed resolve o
problema de origem do primeiro `admin_global`: como só um `admin_global` pode criar usuário
(RN-001, RN-006), e não existe nenhum ainda no primeiro deploy, o primeiro precisa nascer por
um caminho fora da API.

#### O que deve ser feito

- [ ] Criar `backend/src/db/migrations/001_create_table_usuarios.sql`:
      ```sql
      CREATE TABLE usuarios (
        id TEXT PRIMARY KEY,
        cpf TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        papel TEXT NOT NULL CHECK (papel IN ('admin_global','usuario')),
        criado_em TEXT NOT NULL
      );
      ```
- [ ] Criar `backend/src/db/migrations/002_create_table_clientes.sql`:
      ```sql
      CREATE TABLE clientes (
        id TEXT PRIMARY KEY,
        tipo TEXT NOT NULL CHECK (tipo IN ('PF','PJ')),
        documento TEXT NOT NULL UNIQUE,
        nome_completo TEXT,
        data_nascimento TEXT,
        nome_fantasia TEXT,
        razao_social TEXT,
        data_abertura TEXT,
        endereco TEXT NOT NULL,
        telefone TEXT NOT NULL,
        criado_em TEXT NOT NULL,
        atualizado_em TEXT NOT NULL,
        excluido_em TEXT
      );
      CREATE INDEX idx_clientes_excluido_em ON clientes (excluido_em);
      ```
- [ ] Criar `backend/src/db/migrations/003_create_table_socios.sql`:
      ```sql
      CREATE TABLE socios (
        id TEXT PRIMARY KEY,
        cliente_id TEXT NOT NULL REFERENCES clientes(id),
        nome_completo TEXT NOT NULL,
        cpf TEXT NOT NULL,
        UNIQUE (cliente_id, cpf)
      );
      CREATE INDEX idx_socios_cliente_id ON socios (cliente_id);
      ```
- [ ] Criar `backend/src/db/migrations/004_create_table_sessoes.sql`:
      ```sql
      CREATE TABLE sessoes (
        id TEXT PRIMARY KEY,
        usuario_id TEXT NOT NULL REFERENCES usuarios(id),
        criado_em TEXT NOT NULL,
        ultima_atividade_em TEXT NOT NULL,
        encerrada_em TEXT
      );
      CREATE INDEX idx_sessoes_usuario_id ON sessoes (usuario_id);
      ```
- [ ] Criar `backend/src/db/migrate.ts`: cria a tabela de controle `_migrations` (`nome TEXT
      PRIMARY KEY`, `aplicada_em TEXT`) se não existir; lê `migrations/*.sql` em ordem
      numérica; aplica (dentro de uma transação por arquivo) e registra em `_migrations`
      só as que ainda não constam lá
- [ ] Criar `backend/src/db/seed.ts`: lê `SEED_ADMIN_CPF` e `SEED_ADMIN_SENHA` do ambiente;
      se já existir alguma linha com `papel = 'admin_global'`, encerra sem erro informando
      que o seed já foi aplicado (idempotente); senão, gera hash `scrypt` da senha e insere
      o usuário com `papel = 'admin_global'`
- [ ] Adicionar em `backend/package.json`: `"migrate": "ts-node src/db/migrate.ts"` e
      `"seed": "ts-node src/db/seed.ts"`
- [ ] Acrescentar `SEED_ADMIN_CPF` e `SEED_ADMIN_SENHA` em `backend/.env.example`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/db/migrations/001_create_table_usuarios.sql` | criar | schema acima |
| `backend/src/db/migrations/002_create_table_clientes.sql` | criar | schema acima |
| `backend/src/db/migrations/003_create_table_socios.sql` | criar | schema acima |
| `backend/src/db/migrations/004_create_table_sessoes.sql` | criar | schema acima |
| `backend/src/db/migrate.ts` | criar | runner com tabela `_migrations` |
| `backend/src/db/seed.ts` | criar | cria o 1º `admin_global`, idempotente |
| `backend/package.json` | alterar | scripts `migrate` e `seed` |
| `backend/.env.example` | alterar | `SEED_ADMIN_CPF`, `SEED_ADMIN_SENHA` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/data-model.md`, seções "Tabelas" (schema
literal das 4 tabelas, copiado acima) e "Seed inicial" (por que o seed existe fora das
migrations).

#### Guia técnico — pontos de atenção

- Migration aplicada **nunca** é editada — qualquer correção de schema é uma migration `005`
  nova (mesma regra de `backend/java/database.md`, citada em `data-model.md`).
- O seed precisa ser idempotente: rodar `npm run seed` duas vezes não pode criar um segundo
  `admin_global`.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `npm run migrate` cria as 4 tabelas + `_migrations`; rodar de novo não falha e não duplica nada | inspecionar `data/app.db` |
| 2 | `npm run seed` cria exatamente 1 linha em `usuarios` com `papel = 'admin_global'` | `SELECT * FROM usuarios` |
| 3 | Rodar `npm run seed` uma segunda vez não cria um segundo `admin_global` | mesma consulta, contagem continua 1 |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`, schema copiado literalmente de `data-model.md`. |

---

### TASK-01.3 — Domínio sessão: login e validação [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.2
- **Cenários cobertos:** SCN-001.1, SCN-001.2
- **Origem:** `docs/techspec/cadastro-clientes/contracts/sessao.md` (`POST`/`GET` apenas — o
  `DELETE` de logout é RF-009, entregue em EPIC-05 de propósito, porque nasceu de uma emenda
  posterior ao PRD original)

#### Contexto

Entrega o lado backend de RF-001 (login): criar sessão e validá-la. O logout (`DELETE`,
RF-009) fica fora desta task — tem épico próprio (EPIC-05) porque é uma emenda posterior ao
PRD, e misturá-lo aqui perderia a rastreabilidade de que essa parte do escopo chegou depois.

#### O que deve ser feito

- [ ] Criar `backend/src/sessao/model.ts`:
      ```ts
      export type Papel = 'admin_global' | 'usuario';
      export type SessaoCriada = { id: string; usuarioId: string; papel: Papel; criadoEm: string };
      export type SessaoValidada = { id: string; usuarioId: string; papel: Papel; ultimaAtividadeEm: string };
      ```
- [ ] Criar `backend/src/sessao/repository.ts`: `criarSessao(usuarioId: string): SessaoCriada`
      (gera `id = crypto.randomBytes(32).toString('hex')`, insere com `criado_em` e
      `ultima_atividade_em` = agora); `buscarSessaoPorId(id: string)`; `tocarSessao(id:
      string)` (atualiza `ultima_atividade_em` para agora)
- [ ] Criar `backend/src/sessao/service.ts`:
      - `login(cpf: string, senha: string): SessaoCriada` — busca usuário por `cpf`; se não
        existir OU `scrypt(senha) !== senha_hash`, lança erro de autenticação (401, sem
        `codigoRegra`, mensagem genérica — **a mesma** para os dois casos); senão cria e
        retorna a sessão
      - `validarSessao(id: string): SessaoValidada` — busca a sessão; se não existir, se
        `encerrada_em` estiver preenchido, ou se `(Date.now() - ultima_atividade_em) >= 5 *
        60 * 1000` (RN-004, 5 minutos), lança erro de autenticação (401); senão chama
        `tocarSessao(id)` e retorna os dados atualizados
- [ ] Criar `backend/src/sessao/routes.ts`:
      - `POST /` — valida `{ cpf: string, senha: string }` com Zod; chama `login`; sucesso:
        `201`, header `Location: /v1/sessoes/{id}`, corpo `{ id, usuarioId, papel, criadoEm
        }` (nunca senha/hash)
      - `GET /:id` — chama `validarSessao`; sucesso: `200` com `{ id, usuarioId, papel,
        ultimaAtividadeEm }`; erro: `401` com `type: "urn:cadastro-clientes:erro:nao-autenticado"`
- [ ] Montar o router de `sessao` em `backend/src/app.ts` sob o prefixo `/v1/sessoes`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/sessao/model.ts` | criar | tipos acima |
| `backend/src/sessao/repository.ts` | criar | `criarSessao`, `buscarSessaoPorId`, `tocarSessao` |
| `backend/src/sessao/service.ts` | criar | `login`, `validarSessao` |
| `backend/src/sessao/routes.ts` | criar | `POST /`, `GET /:id` |
| `backend/src/app.ts` | alterar | monta o router em `/v1/sessoes` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/sessao.md` (contratos `POST
/v1/sessoes` e `GET /v1/sessoes/{id}`, literal) e `governance/guidelines/backend/node/architecture.md`
§5 (sessão por id opaco, hash `scrypt`, nunca JWT).

#### Guia técnico — pontos de atenção

- Nunca logar CPF nem senha, em nenhum nível (`governance/guidelines/backend/node/coding-standards.md`).
- O erro de `login` é **sempre** o mesmo texto para "CPF inexistente" e "senha errada" —
  qualquer diferença de mensagem ou de tempo de resposta perceptível quebra SCN-001.2.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /v1/sessoes` com CPF/senha do admin do seed devolve `201` com `id`, `usuarioId`, `papel: "admin_global"`, `criadoEm` | `curl` conforme `docs/techspec/cadastro-clientes/quickstart.md`, exemplo RF-001 |
| 2 | `POST /v1/sessoes` com senha errada e com CPF inexistente devolvem o **mesmo** corpo de erro `401` | dois `curl`s comparando o corpo |
| 3 | `GET /v1/sessoes/{id}` de uma sessão recém-criada devolve `200` | `curl` encadeado ao passo 1 |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; escopo do `DELETE` (logout) deliberadamente excluído — ver EPIC-05. |

---

### TASK-01.4 — Scaffolding do frontend Next.js [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** nenhuma
- **Cenários cobertos:** SCN-001.1
- **Origem:** `governance/guidelines/frontend/nextjs/design-system.md`, `frontend/_shared/design-system-common.md`, `frontend/_shared/design-tokens.json`

#### Contexto

Estrutura mínima do BFF/SPA, reaproveitando integralmente o design system Banestes já
elaborado — nenhuma decisão de marca, cor ou tipografia é tomada aqui, só materialização.

#### O que deve ser feito

- [ ] Criar `frontend/package.json` com as versões de `governance/guidelines/frontend/nextjs/stack.md`:
      Next.js 16, React 19, TypeScript, Tailwind CSS 3.4.17, `class-variance-authority`,
      `clsx`, `tailwind-merge`, `tailwindcss-animate`, `@phosphor-icons/react`, primitivos
      `@radix-ui/react-*` necessários a `Button`, `Input`, `Table`, `AlertDialog`
- [ ] Criar `frontend/src/lib/utils.ts` com a função `cn()` (`clsx` + `tailwind-merge`),
      conforme `governance/guidelines/frontend/nextjs/design-system.md` ("Mecânica de
      composição")
- [ ] Criar os primitivos mínimos em `frontend/src/components/ui/`: `button.tsx`,
      `input.tsx`, `table.tsx`, `alert-dialog.tsx` — API conforme
      `governance/guidelines/frontend/_shared/design-system-common.md` (headless + CVA +
      `cn()`); se `governance/guidelines/frontend/nextjs/components/` já tiver o código-fonte
      pronto, copiar literalmente de lá em vez de reescrever
- [ ] Criar `frontend/tailwind.config.ts` e `frontend/src/app/globals.css` com os tokens de
      `governance/guidelines/frontend/_shared/design-tokens.json`: cores semânticas `light`
      (`background #ffffff`, `foreground #374151`, `primary #004b8d`, `primary-hover
      #003564`, `destructive-foreground #991b1b`, etc. — copiar a tabela `color.semantic.light`
      inteira) e `dark`; `--space-base: 1rem`; `--radius: 1rem`
- [ ] Criar `frontend/src/app/layout.tsx` mínimo, fonte Inter (`next/font/local` se o arquivo
      da fonte estiver disponível no ambiente; `next/font/google` como alternativa documentada
      em comentário se não estiver)
- [ ] Criar `frontend/.env.example` documentando `API_GATEWAY_URL` e `SESSION_COOKIE_SECRET`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/package.json` | criar | dependências e versões acima |
| `frontend/tailwind.config.ts` | criar | cores/espaçamento/radius dos tokens |
| `frontend/src/app/globals.css` | criar | CSS custom properties `:root`/`.dark` |
| `frontend/src/app/layout.tsx` | criar | fonte Inter |
| `frontend/src/lib/utils.ts` | criar | `cn()` |
| `frontend/src/components/ui/button.tsx` | criar | primitivo do design system |
| `frontend/src/components/ui/input.tsx` | criar | primitivo do design system |
| `frontend/src/components/ui/table.tsx` | criar | primitivo do design system |
| `frontend/src/components/ui/alert-dialog.tsx` | criar | primitivo do design system |
| `frontend/.env.example` | criar | `API_GATEWAY_URL`, `SESSION_COOKIE_SECRET` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `docs/design/cadastro-clientes/prototypes/*.html`
(são referência visual, não código de produção), `frontend/test/` ou `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `governance/guidelines/frontend/nextjs/design-system.md` e
`frontend/_shared/design-system-common.md` (tokens, mecânica `cn()`/CVA);
`governance/guidelines/frontend/_shared/design-tokens.json` (valores exatos);
`docs/design/cadastro-clientes/prototypes/Login.html` como referência do resultado visual
esperado (não copiar HTML estático — é protótipo, não componente React).

#### Guia técnico — pontos de atenção

- Nenhum valor de cor/espaçamento/raio é aproximado — todos vêm literalmente de
  `governance/guidelines/frontend/_shared/design-tokens.json`.
- `'use client'` só nos primitivos interativos (`Button`, `Input`, `AlertDialog`); `Table`
  pode ser apresentacional se não tiver estado próprio.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `cd frontend && npm install && npm run dev` sobe em `localhost:3000` sem erro | execução manual |
| 2 | Uma página de teste renderiza o `Button` do design system com `background-color: #004b8d` computado | inspeção no DevTools do browser |
| 3 | `npm run build` compila sem erro de tipo | execução manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`, a partir da coleção `frontend/nextjs` elaborada. |

---

### TASK-01.5 — BFF: proxy de sessão e cookie [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.3, TASK-01.4
- **Cenários cobertos:** SCN-001.1, SCN-001.3
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5 (Arquitetura e Fluxo) e §8 (Segurança)

#### Contexto

O BFF nunca expõe a API core diretamente ao browser. Esta task cria a troca de credencial
por cookie de sessão e a validação de sessão em rotas protegidas — sem isso, nenhuma tela
além do login pode existir.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/sessoes/route.ts`: `POST` lê `{ cpf, senha }` do corpo,
      chama `fetch(`${process.env.API_GATEWAY_URL}/v1/sessoes`, ...)`; em `201`, seta o
      cookie `__Host-sessao` (`httpOnly: true, secure: true, sameSite: 'strict', path: '/'`)
      com o `id` recebido do core, e devolve ao browser **só** `{ papel }` (nunca o `id` da
      sessão em claro no corpo de resposta); em `401`, repassa `401` sem o corpo do core
- [ ] Criar `frontend/src/proxy.ts`: função `validarSessaoAtual()` que lê o cookie
      `__Host-sessao`, chama `GET ${API_GATEWAY_URL}/v1/sessoes/{id}` no core; se `401`,
      limpa o cookie e retorna `null`; se `200`, retorna `{ usuarioId, papel }`
- [ ] Criar `frontend/src/app/(protected)/layout.tsx`: chama `validarSessaoAtual()`; se
      `null`, redireciona para `/login`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/sessoes/route.ts` | criar | `POST` — troca credencial por cookie |
| `frontend/src/proxy.ts` | criar | `validarSessaoAtual()` |
| `frontend/src/app/(protected)/layout.tsx` | criar | redireciona para `/login` sem sessão válida |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes-techspec.md` §5, passos 1 a 4 (fluxo
completo login → cookie → navegação protegida) e §8 ("Cookie `__Host-sessao`: `HttpOnly`,
`Secure`, `SameSite=Strict`, `Path=/`, sem `Domain`").

#### Guia técnico — pontos de atenção

- O `id` de sessão nunca é exposto ao JavaScript do browser — fica só no cookie `HttpOnly`.
  Não incluir o `id` em nenhum corpo JSON que o BFF devolve ao browser.
- `__Host-` exige `Secure` e `Path=/` sem `Domain` — omitir qualquer um desses quebra o
  prefixo no browser.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /api/sessoes` com credencial válida responde com `Set-Cookie: __Host-sessao=...` | `curl -i` ou DevTools |
| 2 | Acessar uma rota sob `app/(protected)/` sem o cookie redireciona para `/login` | navegação manual |
| 3 | Cookie com valor inválido é limpo e a navegação redireciona para `/login` | manipular o cookie manualmente e navegar |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-01.6 — Tela de login (T1) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.5
- **Cenários cobertos:** SCN-001.1, SCN-001.2, SCN-001.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (telas T1, §2-3, §6-7); `docs/design/cadastro-clientes/prototypes/Login.html`

#### Contexto

Fecha o primeiro cenário e2e inteiramente verificável visualmente — é a primeira tela que a
suíte Playwright headed vai abrir.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(public)/login/page.tsx`: formulário com campos CPF (máscara
      via `react-imask`, conforme `governance/guidelines/frontend/nextjs/design-system.md`,
      "Bibliotecas por primitivo") e senha (`type="password"`), usando os componentes `Input`
      e `Button` de `frontend/src/components/ui/`
- [ ] No submit, chama `POST /api/sessoes`; em sucesso, lê `{ papel }` da resposta e
      redireciona: `papel === 'admin_global'` → `/usuarios`; `papel === 'usuario'` → `/clientes`
- [ ] Em erro `401`, exibe a mensagem única "CPF ou senha inválidos" (sem indicar qual campo
      está errado — SCN-001.2) abaixo do formulário
- [ ] Botão de submit entra em estado `loading` (desabilitado + indicador visual) enquanto
      aguarda a resposta, conforme `docs/design/cadastro-clientes-design-brief.md` §6

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(public)/login/page.tsx` | criar | formulário de login |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/Login.html` (referência visual, não alterar).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/Login.html` (resultado visual
esperado — abrir no browser antes de codificar) e `docs/design/cadastro-clientes-design-brief.md`
§2 (cores: `--color-primary #004b8d` no botão de submit), §7 (labels via `htmlFor`/`id`).

#### Guia técnico — pontos de atenção

- A mensagem de erro é **literal e única**: "CPF ou senha inválidos" — não reaproveitar texto
  de validação de formato de campo, que é um erro diferente (não testado aqui).
- SCN-001.3 (expiração em 5 min) não exige nenhuma tela nova — é a mesma tela de login
  reaparecendo depois do redirecionamento por `401` do `(protected)/layout.tsx` (TASK-01.5).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Login com CPF/senha do admin do seed redireciona para `/usuarios` | navegação manual, depois confirmado em `/tests` |
| 2 | Login com senha errada mostra "CPF ou senha inválidos" e permanece em `/login` | navegação manual |
| 3 | Formulário é operável só por teclado (Tab entre campos, Enter submete) | teste manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

## EPIC-02 — Gestão de usuários

- **Sistema:** api + web
- **Entrega:** SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3
- **Depende de:** EPIC-01
- **Fatia vertical:** ao final, o admin global autenticado consegue criar um novo usuário
  (CPF + senha) e ver, somente leitura, a lista de todos os usuários já criados — fecha RF-002
  e RF-003 de ponta a ponta.
- **Gate do épico:** PR aberto e SCN-002.1/.2/.3 e SCN-003.1/.2/.3 passando.

### TASK-02.1 — Middleware de autenticação + domínio usuário (criar/listar) [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.3
- **Cenários cobertos:** SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3
- **Origem:** `docs/techspec/cadastro-clientes/contracts/usuario.md`; `docs/techspec/cadastro-clientes/contracts/sessao.md` (regra "RN-005" e "RN-006" aplicadas aqui)

#### Contexto

Primeiro consumidor da checagem de sessão/papel — por isso esta task cria o middleware
compartilhado de autenticação (reusado depois pelos domínios `cliente` em EPIC-03/04), além do
domínio `usuario` em si (criar e listar).

#### O que deve ser feito

- [ ] Criar `backend/src/middlewares/autenticacao.ts`:
      - `exigirSessao`: lê o header `X-Sessao-Id` (é assim que o BFF repassa a sessão ao
        core — o browser/Playwright nunca manda esse header diretamente, só o BFF); se
        ausente, `401`; chama `sessaoService.validarSessao(id)` (de `backend/src/sessao/service.ts`,
        criado na TASK-01.3); se inválida, `401` (`type: "urn:cadastro-clientes:erro:nao-autenticado"`);
        se válida, anexa `req.sessao = { usuarioId, papel }` e segue
      - `exigirAdminGlobal`: roda depois de `exigirSessao`; se `req.sessao.papel !==
        'admin_global'`, `403` (`type: "urn:cadastro-clientes:erro:acesso-negado"`)
- [ ] Criar `backend/src/usuario/model.ts`:
      ```ts
      export type UsuarioCriado = { id: string; cpf: string; papel: 'usuario'; criadoEm: string };
      export type UsuarioResumo = { id: string; cpf: string; papel: 'admin_global' | 'usuario'; criadoEm: string };
      ```
- [ ] Criar `backend/src/usuario/repository.ts`: `criarUsuario({ cpf, senhaHash }):
      UsuarioCriado` (insere sempre com `papel = 'usuario'` — não existe caminho para criar
      um segundo `admin_global` nesta demo); `buscarUsuarioPorCpf(cpf)`; `listarUsuarios():
      UsuarioResumo[]`
- [ ] Criar `backend/src/usuario/service.ts`:
      - `criarUsuario(cpf: string, senha: string): UsuarioCriado` — se já existe usuário com
        esse `cpf`, lança `ConflitoError` com `codigoRegra: "RN-USU-01"`, `dadosApoio: { cpf
        }` (RN-002, SCN-002.2); senão gera hash `scrypt` da senha e insere
      - `listarUsuarios(): UsuarioResumo[]` — delega ao repository, sem paginação (RNF-004)
- [ ] Criar `backend/src/usuario/routes.ts`, com `exigirSessao` e `exigirAdminGlobal`
      aplicados às duas rotas:
      - `POST /` — valida `{ cpf: string, senha: string (min 8) }` com Zod (`400` se `senha`
        tiver menos de 8 caracteres — RN-003, ou `cpf` fora do formato); chama
        `criarUsuario`; sucesso: `201`, `Location: /v1/usuarios/{id}`, corpo `{ id, cpf,
        papel: "usuario", criadoEm }` (nunca senha/hash)
      - `GET /` — chama `listarUsuarios`; `200` com o array de `UsuarioResumo`
- [ ] Montar o router de `usuario` em `backend/src/app.ts` sob o prefixo `/v1/usuarios`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/middlewares/autenticacao.ts` | criar | `exigirSessao`, `exigirAdminGlobal` |
| `backend/src/usuario/model.ts` | criar | tipos acima |
| `backend/src/usuario/repository.ts` | criar | `criarUsuario`, `buscarUsuarioPorCpf`, `listarUsuarios` |
| `backend/src/usuario/service.ts` | criar | `criarUsuario`, `listarUsuarios` |
| `backend/src/usuario/routes.ts` | criar | `POST /`, `GET /` |
| `backend/src/app.ts` | alterar | monta o router em `/v1/usuarios` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/usuario.md` (contratos `POST
/v1/usuarios` e `GET /v1/usuarios`, literal, incluindo `codigoRegra: "RN-USU-01"`) e
`backend/src/sessao/service.ts` (TASK-01.3) para o formato de erro de autenticação.

#### Guia técnico — pontos de atenção

- `exigirAdminGlobal` nunca decide sozinho sem `exigirSessao` ter rodado antes — a ordem dos
  middlewares importa (sessão inválida deve dar `401`, não `403`).
- Nenhuma rota desta task aceita `papel` no corpo da requisição — `papel = 'usuario'` é fixo
  no `repository`, nunca vindo do cliente da API.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /v1/usuarios` autenticado como admin, com CPF novo e senha de 8+ caracteres, devolve `201` e o usuário passa a aparecer em `GET /v1/usuarios` | `curl` conforme `quickstart.md`, exemplos RF-002 e RF-003 |
| 2 | `POST /v1/usuarios` com CPF já cadastrado devolve `409` com `codigoRegra: "RN-USU-01"` | `curl` repetindo o CPF do passo 1 |
| 3 | `POST /v1/usuarios` e `GET /v1/usuarios` autenticados como `papel: "usuario"` (não admin) devolvem `403` | `curl` com `X-Sessao-Id` de uma sessão de usuário comum |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; middleware de autenticação centralizado aqui para reaproveitamento pelos domínios seguintes. |

---

### TASK-02.2 — BFF: proxy de usuários [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-02.1, TASK-01.5
- **Cenários cobertos:** SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5

#### Contexto

Repassa as chamadas de criação e listagem de usuário ao core, convertendo o cookie de sessão
do browser no header `X-Sessao-Id` que o core espera.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/usuarios/route.ts`:
      - `POST` — lê o cookie `__Host-sessao`, chama `fetch(`${API_GATEWAY_URL}/v1/usuarios`,
        { method: 'POST', headers: { 'X-Sessao-Id': <id-do-cookie> }, body: ... })`; repassa
        o status e o corpo da resposta do core ao browser (`201`, `400`, `403` ou `409`)
      - `GET` — mesma troca de cookie por header, repassa `200` com o array de usuários, ou
        `403`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/usuarios/route.ts` | criar | `POST` e `GET`, proxy para `/v1/usuarios` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `frontend/src/app/api/sessoes/route.ts` (TASK-01.5) — mesmo padrão de leitura
de cookie e troca por header ao chamar o core.

#### Guia técnico — pontos de atenção

- O corpo de erro do core (Problem Details) é repassado como veio — o BFF não reescreve
  `codigoRegra` nem `dadosApoio`.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /api/usuarios` autenticado como admin repassa `201` do core | `curl -i` com cookie de sessão de admin |
| 2 | `GET /api/usuarios` autenticado como `usuario` repassa `403` do core | `curl -i` com cookie de sessão de usuário comum |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-02.3 — Tela de Gestão de usuários (T2) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-02.2
- **Cenários cobertos:** SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T2); `docs/design/cadastro-clientes/prototypes/GestaoUsuarios.html`

#### Contexto

Fecha RF-002 e RF-003 visualmente: formulário de criação de usuário e, na mesma tela, a lista
somente leitura dos já criados.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/usuarios/page.tsx`:
      - Formulário com campos CPF (máscara) e senha, usando `Input`/`Button` do design
        system; submit chama `POST /api/usuarios`
      - Em sucesso (`201`), exibe toast de sucesso ("Usuário criado com sucesso.") e
        atualiza a lista abaixo sem recarregar a página
      - Em `409`, exibe mensagem de conflito referenciando o CPF (`dadosApoio.cpf`)
      - Abaixo do formulário, `Table` (componente do design system) listando `GET
        /api/usuarios` — colunas CPF, papel, criado em — sem ações de editar/excluir
        (RF-003 é somente leitura)
      - Estado vazio: "Nenhum usuário cadastrado além de você." quando a lista tiver só o
        próprio admin global (SCN-003.2)
- [ ] Esta página só é alcançável para `papel === 'admin_global'` — se uma pessoa com
      `papel === 'usuario'` acessar `/usuarios` diretamente, o `(protected)/layout.tsx`
      (TASK-01.5) não distingue papel, então: adicionar aqui a checagem específica desta
      rota (redireciona para `/clientes` se `papel !== 'admin_global'`), já que a
      autorização de fato é sempre conferida no core (SCN-003.3) — esta checagem no
      frontend é só UX, não segurança

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/usuarios/page.tsx` | criar | formulário + lista somente leitura |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/GestaoUsuarios.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/GestaoUsuarios.html` (estados
idle/loading/preenchido/erro/sucesso/vazio já prototipados) e
`docs/design/cadastro-clientes-design-brief.md` §5 ("Tabela de listagem" — somente leitura
para usuários, sem ações por linha).

#### Guia técnico — pontos de atenção

- A segurança real está no `403` do core (TASK-02.1) — o redirecionamento desta página para
  usuário comum é só conveniência de navegação, nunca o único controle de acesso.
- Não adicionar nenhuma ação de editar/excluir usuário — está fora do escopo aprovado
  (Shape Brief).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Admin global cria um usuário pela tela e ele aparece na lista logo abaixo, sem reload | navegação manual, depois confirmado em `/tests` |
| 2 | Criar com CPF repetido mostra mensagem de conflito citando o CPF | navegação manual |
| 3 | Usuário comum não vê a opção de criar usuário (redirecionado) | navegação manual com sessão de usuário comum |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

## EPIC-03 — Inclusão e listagem de clientes (PF e PJ)

- **Sistema:** api + web
- **Entrega:** SCN-004.1, SCN-004.2, SCN-004.3, SCN-005.1, SCN-005.2, SCN-005.3, SCN-008.1, SCN-008.2, SCN-008.3
- **Depende de:** EPIC-01
- **Fatia vertical:** ao final, o usuário autenticado consegue cadastrar um cliente PF ou PJ
  (com sócios) e vê-lo imediatamente na lista de clientes — fecha RF-004, RF-005 e RF-008 de
  ponta a ponta. Edição e exclusão (RF-006, RF-007) ficam para o EPIC-04, que opera sobre o
  cliente já existente criado aqui.
- **Gate do épico:** PR aberto e todos os cenários da seção "Entrega" acima passando.

### TASK-03.1 — Domínio cliente: tipos e schema de validação [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.2
- **Cenários cobertos:** SCN-004.3, SCN-005.3
- **Origem:** `docs/techspec/cadastro-clientes/data-model.md`; `docs/techspec/cadastro-clientes/contracts/cliente.md`

#### Contexto

Define o formato de dado de cliente (PF e PJ) e a validação de entrada — base para
repository, service e rotas das próximas tasks deste épico.

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/model.ts`:
      ```ts
      export type ClientePF = {
        id: string; tipo: 'PF'; documento: string; nomeCompleto: string;
        dataNascimento: string; endereco: string; telefone: string;
        criadoEm: string; atualizadoEm: string;
      };
      export type ClientePJ = {
        id: string; tipo: 'PJ'; documento: string; nomeFantasia: string;
        razaoSocial: string; dataAbertura: string; endereco: string; telefone: string;
        socios: { nomeCompleto: string; cpf: string }[];
        criadoEm: string; atualizadoEm: string;
      };
      export type Cliente = ClientePF | ClientePJ;
      ```
- [ ] Criar `backend/src/cliente/schema.ts` (Zod, união discriminada por `tipo`):
      ```ts
      const socioSchema = z.object({ nomeCompleto: z.string().min(1), cpf: z.string().length(11) });
      const pfSchema = z.object({
        tipo: z.literal('PF'), documento: z.string().length(11),
        nomeCompleto: z.string().min(1), dataNascimento: z.string().min(1),
        endereco: z.string().min(1), telefone: z.string().min(1),
      });
      const pjSchema = z.object({
        tipo: z.literal('PJ'), documento: z.string().length(14),
        nomeFantasia: z.string().min(1), razaoSocial: z.string().min(1),
        dataAbertura: z.string().min(1), endereco: z.string().min(1), telefone: z.string().min(1),
        socios: z.array(socioSchema).min(1),
      });
      export const clienteSchema = z.discriminatedUnion('tipo', [pfSchema, pjSchema]);
      ```

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/model.ts` | criar | tipos `ClientePF`, `ClientePJ`, `Cliente` |
| `backend/src/cliente/schema.ts` | criar | `clienteSchema` (Zod discriminated union) |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/data-model.md` (colunas de `clientes` e
`socios`, literal) e `docs/techspec/cadastro-clientes/contracts/cliente.md` (campos exatos do
`POST /v1/clientes`, PF e PJ).

#### Guia técnico — pontos de atenção

- `socios: z.array(socioSchema).min(1)` é a validação que cobre SCN-005.3 (PJ sem nenhum
  sócio) — é erro de schema (`400`), não regra de negócio no service (RN-008 já citada no
  PRD como procedência, mas o mecanismo de verificação é o schema, não um `if` manual).
- Não trocar o nome dos campos — `nomeCompleto`, `dataNascimento`, `nomeFantasia`,
  `razaoSocial`, `dataAbertura` são os nomes exatos do contrato.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `clienteSchema.parse(...)` aceita o payload PF do exemplo RF-004 em `quickstart.md` | teste manual (script Node) |
| 2 | `clienteSchema.parse(...)` rejeita PJ com `socios: []` ou sem o campo `socios` | teste manual |
| 3 | `clienteSchema.parse(...)` rejeita `tipo` diferente de `'PF'`/`'PJ'` | teste manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`, campos copiados literalmente do contrato. |

---

### TASK-03.2 — Domínio cliente: repository [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.1
- **Cenários cobertos:** SCN-004.1, SCN-005.1, SCN-008.1, SCN-008.2
- **Origem:** `docs/techspec/cadastro-clientes/data-model.md`

#### Contexto

Acesso a dado do domínio cliente — único lugar que fala com o SQLite para `clientes` e
`socios`.

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/repository.ts`:
      - `inserirCliente(dados: Omit<Cliente, 'id'|'criadoEm'|'atualizadoEm'>): Cliente` —
        gera `id` (`crypto.randomUUID()`), grava `criado_em = atualizado_em = agora`; se
        `tipo === 'PJ'`, insere cada item de `socios` em `socios` com o `cliente_id`
        correspondente; `INSERT` do cliente e dos sócios dentro da mesma transação
      - `buscarPorDocumento(documento: string): Cliente | null`
      - `listarAtivos(): Cliente[]` — `WHERE excluido_em IS NULL`; para cada `PJ`, junta os
        sócios de `socios`
      - `buscarPorId(id: string): { cliente: Cliente; excluidoEm: string | null } | null`
      - `atualizarCliente(id: string, dados): Cliente` — `UPDATE` dos campos +
        `atualizado_em`; se `PJ`, apaga os sócios antigos e insere os novos (substituição
        completa, sem merge incremental)
      - `marcarExcluido(id: string): void` — `UPDATE clientes SET excluido_em = ? WHERE id =
        ? AND excluido_em IS NULL` (não reescreve se já estava excluído — idempotente por
        construção)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/repository.ts` | criar | funções acima |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/data-model.md` ("Tabelas" — `clientes`,
`socios`, índices) e `governance/guidelines/backend/node/architecture.md` §3 ("a linha crua
lida do SQLite nunca sai do `repository`").

#### Guia técnico — pontos de atenção

- A constraint `UNIQUE` em `documento` lança erro no `INSERT` do SQLite — deixar esse erro
  propagar (ou traduzi-lo para um valor de retorno reconhecível) para o `service` decidir o
  `ConflitoError` (RN-007) — a decisão de qual dos dois mecanismos usar é livre, desde que o
  `service` (TASK-03.3) consiga distinguir "documento duplicado" de qualquer outro erro.
- Sócios são substituídos por completo na edição (apagar tudo e reinserir), nunca mesclados
  campo a campo — simplicidade aceitável na escala desta demo.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `inserirCliente` com dados PF grava e devolve o cliente com `id` gerado | script Node manual |
| 2 | `inserirCliente` com dados PJ grava os sócios vinculados ao `cliente_id` correto | `SELECT * FROM socios` |
| 3 | `listarAtivos()` não retorna um cliente depois de `marcarExcluido(id)` ter sido chamado para ele | inserir, excluir, listar |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-03.3 — Domínio cliente: regras de negócio [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.2
- **Cenários cobertos:** SCN-004.2, SCN-005.2
- **Origem:** `docs/techspec/cadastro-clientes/contracts/cliente.md`; `docs/techspec/cadastro-clientes/data-model.md` ("Decisão de modelagem — exclusão lógica")

#### Contexto

Aplica as regras de negócio que o schema (TASK-03.1) e o repository (TASK-03.2) sozinhos não
cobrem: duplicidade de documento e a distinção 404/410 usada pela edição e exclusão (que
chegam no EPIC-04, mas o método já nasce pronto para os dois usos).

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/service.ts`:
      - `incluirCliente(dados: z.infer<typeof clienteSchema>): Cliente` — chama
        `buscarPorDocumento(dados.documento)`; se existir, lança `ConflitoError` com
        `codigoRegra: "RN-CLI-01"`, `dadosApoio: { documento: dados.documento }` (RN-007);
        senão chama `inserirCliente`
      - `listarClientes(): Cliente[]` — delega a `listarAtivos()`
      - `obterCliente(id: string): Cliente` — chama `buscarPorId(id)`; se `null`, lança
        `RecursoNaoEncontradoError(404)`; se `excluidoEm` preenchido, lança
        `RecursoNaoEncontradoError(410)`; senão devolve `cliente`
      - `editarCliente(id: string, dados): Cliente` — chama `obterCliente(id)` primeiro (dá
        os `404`/`410` corretos antes de validar o resto); se campo obrigatório do `tipo`
        ficaria vazio, lança erro de validação (`400`); senão chama `atualizarCliente`
      - `excluirCliente(id: string): void` — chama `buscarPorId(id)`; se `null` (nunca
        existiu), lança `RecursoNaoEncontradoError(404)`; se encontrado (excluído ou não),
        chama `marcarExcluido(id)` sem lançar erro nos dois casos (idempotente, RF-007
        SCN-007.2)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/service.ts` | criar | funções acima |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/cliente.md` (todos os status code
e `codigoRegra`, literal) e `backend/src/core/errors.ts` (TASK-01.1 — `RecursoNaoEncontradoError`
aceita `status` no construtor, por isso serve tanto para `404` quanto para `410`).

#### Guia técnico — pontos de atenção

- `excluirCliente` **nunca** lança erro para "já estava excluído" — só para "nunca existiu".
  É a diferença entre `DELETE` (idempotente, sempre sucesso se encontrou a linha alguma vez)
  e `GET`/`PUT` (que precisam de `410` para avisar que não há mais o que ler/editar) — ver
  `docs/techspec/cadastro-clientes/contracts/cliente.md`, nota "Por que `DELETE` não usa 410".
- `editarCliente` não implementa controle de concorrência (SCN-006.3, EPIC-04) — a última
  chamada que chegar prevalece, decisão já registrada, não lacuna.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `incluirCliente` com `documento` já cadastrado lança erro com `codigoRegra: "RN-CLI-01"` | script Node manual |
| 2 | `obterCliente` de um `id` inexistente lança erro com `status 404`; de um cliente já excluído lança `status 410` | script Node manual, os dois casos |
| 3 | `excluirCliente` chamado duas vezes seguidas no mesmo `id` não lança erro na segunda chamada | script Node manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; `editarCliente`/`excluirCliente` escritos aqui mas só expostos por rota no EPIC-04. |

---

### TASK-03.4 — Domínio cliente: rotas de inclusão e listagem [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.3, TASK-02.1
- **Cenários cobertos:** SCN-004.1, SCN-004.2, SCN-004.3, SCN-005.1, SCN-005.2, SCN-005.3, SCN-008.1, SCN-008.2
- **Origem:** `docs/techspec/cadastro-clientes/contracts/cliente.md` (`POST /v1/clientes`, `GET /v1/clientes`)

#### Contexto

Expõe `incluirCliente` e `listarClientes` como rotas HTTP. As rotas `GET /:id`, `PUT /:id` e
`DELETE /:id` são acrescentadas a este mesmo arquivo pelo EPIC-04 — não são criadas aqui de
propósito, para manter o PR desta task do tamanho do que ele entrega.

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/routes.ts`, com o middleware `exigirSessao` (de
      `backend/src/middlewares/autenticacao.ts`, TASK-02.1) aplicado a **todas** as rotas
      deste domínio — qualquer papel autenticado pode operar cliente (RN-005; diferente de
      `usuario.md`, aqui **não** se aplica `exigirAdminGlobal`):
      - `POST /` — valida o corpo com `clienteSchema` (`400` com `errors[]` se inválido);
        chama `incluirCliente`; sucesso: `201`, `Location: /v1/clientes/{id}`, corpo do
        cliente criado; conflito: `409` com `codigoRegra: "RN-CLI-01"`, `dadosApoio: {
        documento }`
      - `GET /` — chama `listarClientes`; `200` com o array (vazio se não houver nenhum)
- [ ] Montar o router de `cliente` em `backend/src/app.ts` sob o prefixo `/v1/clientes`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/routes.ts` | criar | `POST /`, `GET /` (só isso nesta task) |
| `backend/src/app.ts` | alterar | monta o router em `/v1/clientes` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/cliente.md` (seções `POST
/v1/clientes` e `GET /v1/clientes`, literal) e `backend/src/usuario/routes.ts` (TASK-02.1,
mesmo padrão de middleware + Zod + tradução de erro).

#### Guia técnico — pontos de atenção

- Só `exigirSessao`, nunca `exigirAdminGlobal`, nas rotas de cliente — RN-005 exige sessão,
  não papel específico.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /v1/clientes` com o payload PF do exemplo RF-004 de `quickstart.md` devolve `201` | `curl` |
| 2 | `POST /v1/clientes` com o payload PJ (com sócio) do exemplo RF-005 devolve `201` com `socios` no corpo | `curl` |
| 3 | `GET /v1/clientes` em banco sem nenhum cliente devolve `200` com array vazio | `curl` em ambiente recém-migrado |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; `GET /:id`, `PUT /:id`, `DELETE /:id` deliberadamente fora — ver EPIC-04. |

---

### TASK-03.5 — BFF: proxy de clientes (incluir/listar) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.4, TASK-01.5
- **Cenários cobertos:** SCN-004.1, SCN-005.1, SCN-008.1, SCN-008.2
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5

#### Contexto

Repassa inclusão e listagem de cliente ao core, no mesmo padrão já usado para sessão e
usuário.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/clientes/route.ts`:
      - `POST` — lê o cookie `__Host-sessao`, chama o core com `X-Sessao-Id`, repassa `201`,
        `400` ou `409`
      - `GET` — mesma troca, repassa `200` com o array de clientes

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/clientes/route.ts` | criar | `POST` e `GET`, proxy para `/v1/clientes` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `frontend/src/app/api/usuarios/route.ts` (TASK-02.2).

#### Guia técnico — pontos de atenção

- Nenhuma checagem de papel aqui — RN-005 só exige sessão válida, qualquer papel passa.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /api/clientes` autenticado (qualquer papel) repassa `201` do core | `curl -i` |
| 2 | `GET /api/clientes` autenticado repassa `200` com o array | `curl -i` |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-03.6 — Tela de Lista de clientes (T3) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.5
- **Cenários cobertos:** SCN-008.1, SCN-008.2, SCN-008.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T3); `docs/design/cadastro-clientes/prototypes/ListaClientes.html`

#### Contexto

Fecha RF-008 visualmente e é o ponto de entrada para incluir, editar e excluir cliente.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/clientes/page.tsx`: `Table` do design system
      listando `GET /api/clientes` — colunas tipo, documento, nome (nome completo se PF,
      razão social se PJ), telefone; botão "Incluir cliente" (link para `/clientes/novo`);
      estado `loading` (skeleton), estado vazio ("Nenhum cliente cadastrado."), estado de
      erro ao carregar a lista

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/page.tsx` | criar | listagem + botão incluir |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/ListaClientes.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/ListaClientes.html` (estados
idle/loading/erro/vazio já prototipados).

#### Guia técnico — pontos de atenção

- As ações de **editar** e **excluir** por linha **não** entram nesta task — são
  acrescentadas a este mesmo arquivo pelo EPIC-04 (TASK-04.5 e TASK-04.6), que altera este
  componente em vez de recriá-lo.
- O redirecionamento para `/login` sem sessão já é herdado do `(protected)/layout.tsx`
  (TASK-01.5) — não reimplementar aqui.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | A lista exibe todos os clientes cadastrados | navegação manual |
| 2 | Com nenhum cliente cadastrado, aparece a mensagem de lista vazia | ambiente recém-migrado |
| 3 | Acessar `/clientes` sem sessão redireciona para `/login` | navegação manual sem cookie |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; ações de editar/excluir deliberadamente fora — ver EPIC-04. |

---

### TASK-03.7 — Formulário de inclusão de cliente Pessoa Física (T4) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.6
- **Cenários cobertos:** SCN-004.1, SCN-004.2, SCN-004.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T4); `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`

#### Contexto

Fecha RF-004 visualmente — formulário de inclusão para Pessoa Física.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/clientes/novo/page.tsx`: seletor de tipo (Pessoa
      Física / Pessoa Jurídica) no topo; quando Pessoa Física, mostra os campos
      `nomeCompleto`, `documento` (CPF, máscara), `dataNascimento`, `endereco`, `telefone`;
      validação do formulário com o **mesmo** schema Zod do backend (`backend/src/cliente/schema.ts`,
      TASK-03.1 — reescrever a validação no lado do formulário com `react-hook-form` +
      `@hookform/resolvers/zod`, espelhando os campos)
- [ ] Submit chama `POST /api/clientes` com `{ tipo: 'PF', ... }`; sucesso: toast ("Cliente
      cadastrado com sucesso.") e redireciona para `/clientes`, onde o novo cliente aparece
      na lista
- [ ] Erro `400`: mensagem inline por campo, a partir de `errors[{ field, message }]` da
      resposta
- [ ] Erro `409`: toast de conflito citando o documento (`dadosApoio.documento`)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/novo/page.tsx` | criar | formulário, modo Pessoa Física |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`
(estado Pessoa Física) e `backend/src/cliente/schema.ts` (TASK-03.1, campos exatos a
espelhar no formulário).

#### Guia técnico — pontos de atenção

- O campo `tipo` não é alterável depois de criado (regra que vale para a edição, no EPIC-04)
  — aqui, na inclusão, é só a primeira escolha do formulário.
- O modo Pessoa Jurídica desta mesma página é acrescentado pela TASK-03.8, que altera este
  arquivo — não deixar a estrutura do componente de um jeito que dificulte adicionar o modo
  PJ em seguida (ex.: isolar os campos de PF em um sub-componente ou bloco condicional claro).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Preencher todos os campos de Pessoa Física e confirmar cria o cliente e redireciona para `/clientes`, onde ele aparece | navegação manual |
| 2 | Deixar um campo obrigatório vazio mostra erro inline no campo, sem submeter | navegação manual |
| 3 | Incluir com um CPF já cadastrado mostra mensagem de conflito | navegação manual, repetindo CPF |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-03.8 — Formulário de inclusão de cliente Pessoa Jurídica com sócios (T4, DDR-001) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.7
- **Cenários cobertos:** SCN-005.1, SCN-005.2, SCN-005.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T4, modo PJ);
  `docs/decisions/DDR-001-lista-dinamica-de-socios.md`

#### Contexto

Fecha RF-005 visualmente — acrescenta o modo Pessoa Jurídica ao formulário criado na
TASK-03.7, com a lista dinâmica de sócios decidida em DDR-001.

#### O que deve ser feito

- [ ] Alterar `frontend/src/app/(protected)/clientes/novo/page.tsx`: quando o tipo
      selecionado for Pessoa Jurídica, mostrar os campos `nomeFantasia`, `razaoSocial`,
      `documento` (CNPJ, máscara), `dataAbertura`, `endereco`, `telefone`, e a lista
      dinâmica de sócios
- [ ] Lista de sócios (via `useFieldArray` do `react-hook-form`): cada linha com `Input`
      `nomeCompleto` + `Input` `cpf` (máscara) + `Button` ghost com ícone "remover"; rodapé
      com `Button` secondary "Adicionar sócio"; **sem limite de linhas** (DDR-001)
- [ ] Submit bloqueado com erro inline se a lista de sócios estiver vazia (espelha
      `socios.min(1)` do schema do backend, TASK-03.1 — SCN-005.3)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/novo/page.tsx` | alterar | acrescenta o modo Pessoa Jurídica |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`
(estado Pessoa Jurídica, lista de sócios) e `docs/decisions/DDR-001-lista-dinamica-de-socios.md`
(decisão e motivo, inclusive a alternativa descartada de limitar a quantidade de sócios).

#### Guia técnico — pontos de atenção

- Sem limite de sócios — não adicionar paginação nem truncamento da lista (DDR-001 já
  decidiu aceitar esse trade-off nesta demo).
- `aria-label` obrigatório no botão ghost ícone "remover" (acessibilidade — `docs/design/cadastro-clientes-design-brief.md`
  §7).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Alternar para Pessoa Jurídica mostra os campos corretos e a lista de sócios com uma linha inicial | navegação manual |
| 2 | Adicionar e remover linhas de sócio funciona sem limite (testar com 5 ou mais) | navegação manual |
| 3 | Confirmar sem nenhum sócio mostra erro inline e não submete | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

## EPIC-04 — Edição e exclusão de clientes

- **Sistema:** api + web
- **Entrega:** SCN-006.1, SCN-006.2, SCN-006.3, SCN-007.1, SCN-007.2, SCN-007.3
- **Depende de:** EPIC-03
- **Fatia vertical:** ao final, o usuário consegue editar e excluir um cliente já cadastrado
  pela tela de lista — fecha RF-006 e RF-007. Opera sobre o domínio `cliente` criado no
  EPIC-03 (o `service`/`repository` já nasceram prontos para edição e exclusão lá; aqui só se
  expõe a rota e a tela).
- **Gate do épico:** PR aberto e todos os cenários da seção "Entrega" acima passando.

### TASK-04.1 — Domínio cliente: rotas de obter, editar e excluir [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.4
- **Cenários cobertos:** SCN-006.1, SCN-006.2, SCN-006.3, SCN-007.1, SCN-007.2, SCN-007.3
- **Origem:** `docs/techspec/cadastro-clientes/contracts/cliente.md` (`GET /v1/clientes/{id}`, `PUT /v1/clientes/{id}`, `DELETE /v1/clientes/{id}`)

#### Contexto

`obterCliente`, `editarCliente` e `excluirCliente` já existem em `backend/src/cliente/service.ts`
desde a TASK-03.3. Esta task só expõe as três rotas que faltavam em
`backend/src/cliente/routes.ts` (criado na TASK-03.4) e acrescenta a única regra que ainda
não tinha lugar: `tipo` não pode ser trocado numa edição.

#### O que deve ser feito

- [ ] Alterar `backend/src/cliente/service.ts`: em `editarCliente(id, dados)`, depois de
      obter o cliente atual (`obterCliente(id)`), se `dados.tipo !== clienteAtual.tipo`,
      lançar erro de validação `400` ("não é permitido alterar o tipo do cliente")
- [ ] Alterar `backend/src/cliente/routes.ts` (adicionar ao router já existente, com
      `exigirSessao` herdado do que a TASK-03.4 já aplicou):
      - `GET /:id` — chama `obterCliente(id)`; `200` com o cliente; o próprio `service` já
        lança `404` (nunca existiu) ou `410` (`type: "urn:cadastro-clientes:erro:nao-encontrado"`,
        `status: 410`) conforme o caso
      - `PUT /:id` — valida o corpo com `clienteSchema`; chama `editarCliente(id, dados)`;
        `200` com o cliente atualizado; `400` (campo obrigatório vazio ou troca de `tipo`);
        `404`/`410` idem `GET`
      - `DELETE /:id` — chama `excluirCliente(id)`; sempre `204` quando o `id` já existiu
        alguma vez (mesmo se já estava excluído); `404` só se o `id` nunca existiu

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/service.ts` | alterar | checagem de imutabilidade de `tipo` em `editarCliente` |
| `backend/src/cliente/routes.ts` | alterar | acrescenta `GET /:id`, `PUT /:id`, `DELETE /:id` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/cliente.md` (seções `GET
/v1/clientes/{id}`, `PUT /v1/clientes/{id}`, `DELETE /v1/clientes/{id}`, literal, incluindo a
nota "Por que `DELETE` não usa 410 como `GET`/`PUT`").

#### Guia técnico — pontos de atenção

- `DELETE` **nunca** devolve `404` para um cliente já excluído — só para um `id` que nunca
  existiu. Não confundir os dois casos.
- SCN-006.3 (edição concorrente) não exige nenhum código novo aqui — a ausência de
  `versao`/`If-Match` já é a implementação da decisão (última escrita prevalece).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `GET /v1/clientes/{id}` de um cliente existente devolve `200`; de um `id` nunca existente devolve `404`; de um cliente excluído devolve `410` | três `curl`s |
| 2 | `PUT /v1/clientes/{id}` com um campo obrigatório vazio devolve `400` e não altera o cliente | `curl` seguido de `GET` para conferir que nada mudou |
| 3 | `DELETE /v1/clientes/{id}` chamado duas vezes seguidas devolve `204` nas duas vezes | dois `curl`s em sequência |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; reaproveita `service` da TASK-03.3, só expõe rota e acrescenta a checagem de `tipo`. |

---

### TASK-04.2 — BFF: proxy de cliente por id [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-04.1, TASK-01.5
- **Cenários cobertos:** SCN-006.1, SCN-006.2, SCN-007.1, SCN-007.2
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5

#### Contexto

Repassa obter, editar e excluir um cliente específico ao core.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/clientes/[id]/route.ts`:
      - `GET` — repassa `200`, `404` ou `410` do core
      - `PUT` — repassa `200` ou `400`
      - `DELETE` — repassa `204` (mesmo se chamado duas vezes) ou `404`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/clientes/[id]/route.ts` | criar | `GET`, `PUT`, `DELETE`, proxy para `/v1/clientes/{id}` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `frontend/src/app/api/clientes/route.ts` (TASK-03.5).

#### Guia técnico — pontos de atenção

- Repassar o status `410` do core sem traduzi-lo para `404` — a tela de edição (TASK-04.3)
  precisa da distinção para mostrar a mensagem certa.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `GET /api/clientes/[id]` repassa `200`/`404`/`410` do core sem alterar o status | `curl -i`, três casos |
| 2 | `PUT /api/clientes/[id]` repassa `200`/`400` do core | `curl -i` |
| 3 | `DELETE /api/clientes/[id]` repassa `204` do core nas duas chamadas seguidas | dois `curl -i` |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-04.3 — Tela de edição de cliente (T4, modo editar) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-04.2, TASK-03.8
- **Cenários cobertos:** SCN-006.1, SCN-006.2
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T4, modo editar); `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`

#### Contexto

Reaproveita o formulário de inclusão criado nas TASK-03.7/03.8, extraído para um componente
compartilhado, agora pré-preenchido com os dados do cliente.

#### O que deve ser feito

- [ ] Extrair o formulário de cliente (campos PF/PJ + lista dinâmica de sócios, hoje dentro
      de `frontend/src/app/(protected)/clientes/novo/page.tsx`) para
      `frontend/src/app/(protected)/clientes/_components/cliente-form.tsx`, recebendo
      `valoresIniciais?: Cliente` e `aoSubmeter: (dados) => Promise<void>` como props
- [ ] Alterar `frontend/src/app/(protected)/clientes/novo/page.tsx` para usar o componente
      extraído, passando `aoSubmeter` que chama `POST /api/clientes` (comportamento
      inalterado)
- [ ] Criar `frontend/src/app/(protected)/clientes/[id]/editar/page.tsx`: carrega o cliente
      via `GET /api/clientes/[id]`; se `410`, mostra "Este cliente foi excluído e não pode
      mais ser editado." com um link de volta para `/clientes` (sem formulário); se `404`,
      mensagem de não encontrado; se `200`, renderiza `ClienteForm` com `valoresIniciais` e
      `tipo` bloqueado (campo desabilitado — PUT não permite trocar `tipo`), `aoSubmeter`
      chamando `PUT /api/clientes/[id]`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/_components/cliente-form.tsx` | criar | formulário compartilhado (extraído) |
| `frontend/src/app/(protected)/clientes/novo/page.tsx` | alterar | passa a usar o componente extraído |
| `frontend/src/app/(protected)/clientes/[id]/editar/page.tsx` | criar | carrega, trata 404/410, usa o formulário compartilhado |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (o
mesmo protótipo cobre os dois modos, incluir e editar).

#### Guia técnico — pontos de atenção

- O campo `tipo` fica **desabilitado** (somente leitura) no modo editar — nunca enviado como
  editável no corpo do `PUT`.
- A extração do formulário não pode mudar o comportamento já validado em TASK-03.7/03.8 —
  é refatoração de local do código, não de regra.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Editar um cliente existente altera o cadastro e os dados novos aparecem na lista | navegação manual |
| 2 | Deixar um campo obrigatório vazio na edição mostra erro inline, sem submeter | navegação manual |
| 3 | Acessar a edição de um cliente já excluído mostra a mensagem apropriada, não o formulário | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-04.4 — Ações de editar/excluir na lista e diálogo de confirmação (T5) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-04.3, TASK-03.6
- **Cenários cobertos:** SCN-007.1, SCN-007.2, SCN-007.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T5); `docs/design/cadastro-clientes/prototypes/ListaClientes.html`

#### Contexto

Fecha RF-007 visualmente. T5 é um `AlertDialog` sobre a própria T3, não uma rota separada —
exatamente como já prototipado.

#### O que deve ser feito

- [ ] Alterar `frontend/src/app/(protected)/clientes/page.tsx` (criado na TASK-03.6):
      acrescentar coluna de ações por linha — link "Editar" (para `/clientes/[id]/editar`) e
      botão "Excluir"
- [ ] Botão "Excluir" abre um `AlertDialog` (componente de `frontend/src/components/ui/`,
      TASK-01.4): título "Excluir cliente [nome]?", `Button` secondary "Cancelar" e `Button`
      destructive "Excluir"
- [ ] Confirmar chama `DELETE /api/clientes/[id]`; sucesso (`204`): remove o cliente da lista
      (sem precisar recarregar a página) e mostra toast de sucesso
- [ ] Nenhum tratamento especial para "cliente já excluído por outra sessão" é necessário no
      frontend — o `DELETE` já responde `204` nesse caso também (TASK-04.1), e a lista
      simplesmente deixa de mostrar o cliente

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/page.tsx` | alterar | acrescenta coluna de ações e o diálogo de confirmação |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/ListaClientes.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/ListaClientes.html` (diálogo de
exclusão já prototipado como overlay da lista).

#### Guia técnico — pontos de atenção

- Exclusão é **definitiva** (RN-009) — nenhuma ação de "desfazer" ou reativação em nenhuma
  tela, mesmo que pareça uma melhoria de UX óbvia.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Excluir um cliente pela lista, confirmando o diálogo, remove-o da lista | navegação manual |
| 2 | Cancelar o diálogo não exclui nada | navegação manual |
| 3 | Depois de excluído, o cliente não aparece em nenhuma lista nem tem forma de reativação na interface | navegação manual, conferindo a lista e a ausência de botão de reativar |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

## EPIC-05 — Logout

- **Sistema:** api + web
- **Entrega:** SCN-009.1, SCN-009.2, SCN-009.3
- **Depende de:** EPIC-01 (reaproveita o domínio `sessao` da TASK-01.3); pode rodar em
  paralelo a EPIC-02, EPIC-03 e EPIC-04
- **Fatia vertical:** ao final, qualquer pessoa autenticada consegue encerrar a própria sessão
  explicitamente, a partir de qualquer tela protegida — fecha RF-009, a emenda pós-gate, e
  resolve a pendência Q-001 da TechSpec (protótipos sem o elemento de logout).
- **Gate do épico:** PR aberto e todos os cenários da seção "Entrega" acima passando.

### TASK-05.1 — Domínio sessão: logout [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.3
- **Cenários cobertos:** SCN-009.1, SCN-009.2, SCN-009.3
- **Origem:** `docs/techspec/cadastro-clientes/contracts/sessao.md` (`DELETE /v1/sessoes/{id}`)

#### Contexto

Acrescenta o `DELETE` de logout aos arquivos de sessão criados na TASK-01.3 — deliberadamente
separado daquela task porque RF-009 nasceu de uma emenda posterior ao PRD original.

#### O que deve ser feito

- [ ] Alterar `backend/src/sessao/repository.ts`: adicionar `encerrarSessao(id: string):
      void` — `UPDATE sessoes SET encerrada_em = ? WHERE id = ? AND encerrada_em IS NULL`
      (não falha nem reescreve se já estava encerrada — idempotente por construção)
- [ ] Alterar `backend/src/sessao/service.ts`: adicionar `logout(id: string): void` — chama
      `encerrarSessao(id)` **sempre**, sem checar antes se a sessão existe, já está
      encerrada ou já expirou (idempotente por design — RF-009, SCN-009.2 e SCN-009.3)
- [ ] Alterar `backend/src/sessao/routes.ts`: adicionar `DELETE /:id` — chama `logout(id)`;
      responde **sempre** `204 No Content`, independentemente do estado anterior da sessão

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/sessao/repository.ts` | alterar | acrescenta `encerrarSessao` |
| `backend/src/sessao/service.ts` | alterar | acrescenta `logout` |
| `backend/src/sessao/routes.ts` | alterar | acrescenta `DELETE /:id` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/sessao.md`, seção `DELETE
/v1/sessoes/{id}` ("204 No Content — sempre, inclusive quando a sessão já estava encerrada ou
expirada").

#### Guia técnico — pontos de atenção

- Diferente do `DELETE` de cliente (que pode devolver `404` se o `id` nunca existiu), o
  `DELETE` de sessão **nunca** devolve erro — nem para um `id` que nunca existiu. É assim por
  definição no contrato, não uma inconsistência a corrigir.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `DELETE /v1/sessoes/{id}` de uma sessão ativa devolve `204`; um `GET /v1/sessoes/{id}` logo depois devolve `401` | dois `curl`s em sequência |
| 2 | `DELETE /v1/sessoes/{id}` chamado duas vezes seguidas devolve `204` nas duas vezes | dois `curl`s |
| 3 | `DELETE /v1/sessoes/{id-qualquer-inexistente}` também devolve `204` | `curl` com um id inventado |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; separada da TASK-01.3 de propósito, por ser uma emenda posterior ao PRD. |

---

### TASK-05.2 — BFF: logout (limpar cookie) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-05.1, TASK-01.5
- **Cenários cobertos:** SCN-009.1
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5, §8

#### Contexto

Acrescenta o handler de logout ao proxy de sessão já existente.

#### O que deve ser feito

- [ ] Alterar `frontend/src/app/api/sessoes/route.ts`: adicionar `DELETE` — lê o cookie
      `__Host-sessao`, chama `DELETE ${API_GATEWAY_URL}/v1/sessoes/{id}` no core; **sempre**
      limpa o cookie `__Host-sessao` da resposta (mesmo que, por algum motivo, a chamada ao
      core falhe — o usuário não pode ficar com um cookie que já tentou encerrar); devolve
      `204` ao browser

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/sessoes/route.ts` | alterar | acrescenta o handler `DELETE` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: o próprio `frontend/src/app/api/sessoes/route.ts` (TASK-01.5, handler
`POST`) — mesmo arquivo, padrão de leitura de cookie já estabelecido.

#### Guia técnico — pontos de atenção

- Limpar o cookie é incondicional — não depender do core responder `204` para isso acontecer.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `DELETE /api/sessoes` limpa o cookie `__Host-sessao` da resposta (`Set-Cookie` com `Max-Age=0` ou equivalente) | `curl -i` |
| 2 | Depois do `DELETE`, acessar uma rota protegida redireciona para `/login` | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |

---

### TASK-05.3 — Navbar autenticada com ação de logout [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-05.2, TASK-02.3, TASK-03.6
- **Cenários cobertos:** SCN-009.1, SCN-009.2, SCN-009.3
- **Origem:** `governance/guidelines/frontend/_shared/design-system-common.md` ("Navbar fixa");
  `docs/techspec/cadastro-clientes-techspec.md` §10, Q-001

#### Contexto

Fecha RF-009 visualmente e resolve a pendência Q-001 da TechSpec: os protótipos de T1–T5
foram feitos antes de RF-009 existir, então não têm o elemento de logout desenhado — esta
task o acrescenta diretamente na implementação, sem reabrir `/design`.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/_components/navbar.tsx`: navbar fixa (altura 80px,
      `border-b`, `z-50`, conforme `governance/guidelines/frontend/_shared/design-system-common.md`)
      com o papel da pessoa autenticada e um botão "Sair" com texto visível (não ícone-only,
      para não exigir `aria-label` extra); ao clicar, chama `DELETE /api/sessoes` e
      redireciona para `/login`
- [ ] Alterar `frontend/src/app/(protected)/layout.tsx` (TASK-01.5): renderizar a `Navbar`
      acima do conteúdo em todas as telas protegidas (`/usuarios`, `/clientes`,
      `/clientes/novo`, `/clientes/[id]/editar`)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/_components/navbar.tsx` | criar | navbar com ação de logout |
| `frontend/src/app/(protected)/layout.tsx` | alterar | renderiza a `Navbar` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/*.html` (referência visual — nenhum protótipo é
alterado; a pendência Q-001 é resolvida na implementação, não retroativamente no protótipo).

#### Guia técnico — padrão a seguir

Referência viva: `governance/guidelines/frontend/_shared/design-system-common.md` ("Navbar
fixa | altura 80 (`h-[5rem]`), `border-b`, `z-50`").

#### Guia técnico — pontos de atenção

- Texto do botão é "Sair", não ícone — simplifica acessibilidade e evita inventar iconografia
  não prevista no design brief.
- Clique duplo rápido no "Sair" não pode gerar erro visível — o backend (TASK-05.1) já é
  idempotente; o frontend só precisa desabilitar o botão após o primeiro clique, como em
  qualquer submit.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Clicar em "Sair" em qualquer tela protegida encerra a sessão e redireciona para `/login` | navegação manual, nas três telas protegidas |
| 2 | Depois do logout, voltar pelo histórico do browser e tentar acessar uma rota protegida redireciona de novo para `/login` | navegação manual |
| 3 | Clicar em "Sair" duas vezes em sequência rápida não produz erro visível na tela | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; resolve a pendência Q-001 da TechSpec. |

---

## Fora do escopo desta entrega

> Em preenchimento incremental — consolidado ao final, a partir da Fronteira de escopo do
> Shape Brief e do Escopo da entrega do PRD.

- Recuperação de senha / "esqueci minha senha" (fora do escopo aprovado no Shape Brief)
- Edição e desativação de usuário pelo admin global (fora do escopo aprovado no Shape Brief)
- Hierarquia entre múltiplos admins globais (fora do escopo aprovado no Shape Brief)
- Logs e auditoria de acesso (fora do escopo aprovado no Shape Brief)
- Integração com sistema real de abertura de conta corrente (fora do escopo aprovado no Shape Brief)
- Job de limpeza de sessões expiradas no banco (TechSpec, Questão em Aberto Q-003 — não bloqueante)

---

## Fora deste artefato — regras negativas

O que aparecer aqui é sinal de etapa anterior mal fechada, e o validador reprova:

- **Requisito novo ou reescrito** — pertence ao `/prd`. Task não cria requisito;
  se algo necessário não tem RF, o PRD está incompleto.
- **Decisão arquitetural** — pertence ao `/techspec`. Escolha de biblioteca,
  padrão ou modelo de dados feita aqui não passou por revisão técnica.
- **Cenário Gherkin novo ou alterado** — os cenários estão congelados no gate de
  spec; mudança exige emenda registrada no PRD, com o ID preservado.
- **Código de teste e step definitions** — pertencem ao `/tests`.
- **Implementação** — trechos de código de produção pertencem ao `/implement`.
  Guia técnico é assinatura e contrato, não corpo de função.
- **User Story** — a camada foi eliminada; o cenário é a narrativa.
