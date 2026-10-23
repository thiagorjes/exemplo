### TASK-01.2 — Migrations das 4 tabelas e seed do admin_global [api]

- **Status:** concluída
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
| `backend/src/core/senha.ts` | criar | `gerarHash`/`conferirSenha` (scrypt) — compartilhado com o domínio `sessao` da TASK-01.3, para não duplicar a lógica de hash |
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
| 2026-10-23 | concluída (tentativa 1 de 3) | 4 migrations criadas literalmente conforme o SQL da task; `migrate.ts` com tabela `_migrations` e aplicação transacional por arquivo. `seed.ts` idempotente. Divergência corrigida: a task pedia scripts `migrate`/`seed` via `ts-node`, dependência não declarada em `governance/guidelines/backend/node/stack.md` — usei o padrão já estabelecido na TASK-01.1 (`npm run build && node --env-file=.env dist/...`) em vez de adicionar uma dependência nova fora da stack aprovada. Criado `backend/src/core/senha.ts` (`gerarHash`/`conferirSenha`, scrypt) como utilitário compartilhado — não estava na tabela de arquivos original, adicionado porque a TASK-01.3 (domínio sessão) vai precisar da mesma lógica de hash para conferir senha no login, e duplicá-la violaria a diretriz de não duplicação. Critérios de aceite 1-3 confirmados manualmente (`npm run migrate` duas vezes sem duplicar; `npm run seed` duas vezes com 1 única linha `admin_global`). `check_escopo.py --base HEAD` → exit 0. |
