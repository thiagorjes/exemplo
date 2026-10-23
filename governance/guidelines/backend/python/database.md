# Banco de Dados — Backend Python

> Condicional da coleção. SQLAlchemy 2.0 assíncrono + Alembic + PostgreSQL 18
> ([`stack.md`](stack.md)). Camadas: [`architecture.md`](architecture.md) §2.

## 1. O que vai (e o que não vai) no banco

| Vai | Não vai |
|---|---|
| Projeção de runs (status, tempos, consumo, tentativas) | Conteúdo de artefato (é do Git) |
| Referência de artefato: `repo`, `branch`, `commit`, caminho, hash | Definições de fluxo e contratos de agente (são do Git, §1.1) |
| Registro de tentativa e de crítica (ponteiros) | Histórico de execução (é do motor) |
| Decisões de gate (quem, quando, commit, justificativa) | Prompt e resposta completos do modelo |
| Auditoria de acesso e de uso de credencial | Segredo de qualquer natureza |

Blob no Postgres transforma backup em problema e consulta em varredura. O banco guarda o ponteiro.

### 1.1 Git é a fonte de verdade dos artefatos

Fluxos, contratos de agente e artefatos produzidos vivem em **Git**
([`flow-contracts.md`](flow-contracts.md)). O banco guarda apenas a referência
(`repo, branch, commit, path, hash`) e o que Git não resolve bem: busca, listagem e projeção de
estado. Cachear conteúdo de artefato em tabela cria uma segunda verdade que envelhece — se
precisar de conteúdo, resolva a referência.

O object storage guarda o que não pertence ao Git: log de runner, prompt/resposta brutos, binário
grande — com retenção e controle de acesso próprios.

## 2. Modelagem

- Chave primária `UUID` gerada pela aplicação (não `SERIAL`): o identificador precisa existir antes
  do insert para compor `workflow_id` e chave de idempotência.
- `created_at` / `updated_at` `TIMESTAMPTZ` em UTC, com default no banco.
- Enum de domínio como `VARCHAR` + `CHECK`, não `ENUM` nativo — alterar `ENUM` no Postgres é
  migration com trava; `CHECK` é barato.
- Toda FK tem índice explícito (o Postgres não cria automaticamente) e `ON DELETE` declarado.
- Unicidade de negócio é `UNIQUE` no banco, não `if exists` no serviço. Corrida só se resolve no
  banco.
- Chave de idempotência de activity é coluna `UNIQUE` — é ela que torna a reexecução segura.
- Coluna anulável exige justificativa; `NULL` que significa "ainda não" é aceitável, `NULL` que
  significa "não se aplica" indica tabela faltando.

## 3. Acesso a dados

- Só `repository.py` fala com SQLAlchemy. Serviço recebe e devolve modelos de domínio.
- API 2.0 de estilo `select()` com `AsyncSession`. Nada de `Query` legada.
- Uma transação por unidade de trabalho, aberta no serviço (`async with session.begin()`), nunca
  dentro do repositório. Repositório que commita esconde o limite transacional.
- `expire_on_commit=False` na sessão; entidade acessada depois do commit não deve disparar I/O
  surpresa.
- Sessão nunca atravessa a borda HTTP nem entra em activity de longa duração. Abrir, usar, fechar.

## 4. Desempenho

- **N+1 é bug**, não lentidão. Relacionamento é `lazy="raise"` por padrão: acesso não planejado
  levanta erro em vez de gerar consulta escondida. Carregar explicitamente com `selectinload`.
- Consulta de listagem usa **projeção** (`select(Model.a, Model.b)` → modelo de transporte), não
  entidade completa.
- Toda listagem é paginada com limite máximo imposto pelo servidor. Endpoint sem teto de página é
  negação de serviço com autenticação.
- Índice criado junto com a consulta que o exige, e justificado no PR. Índice sem consulta é custo
  de escrita.
- `EXPLAIN ANALYZE` obrigatório no PR para consulta nova sobre tabela de crescimento contínuo
  (runs, artefatos, auditoria).
- Atualização em massa por `update()`/`delete()` com `WHERE`, não por laço de entidades.

## 5. Migrations

- Toda mudança de schema é uma migration Alembic versionada e revisada. `create_all` é proibido
  fora de teste.
- `upgrade` **e** `downgrade` implementados e testados contra Postgres real.
- Migration é compatível com a versão anterior da aplicação (deploy sem janela): adicionar coluna
  anulável → backfill → tornar obrigatória, em três releases. Nunca renomear coluna em um passo.
- Migration de dados é separada da migration de schema, idempotente e com registro de progresso.
- `CREATE INDEX CONCURRENTLY` em tabela grande; índice bloqueante em produção é incidente.
- Nenhuma migration é editada depois de aplicada em qualquer ambiente compartilhado.

## 6. Retenção

- Tabelas de crescimento contínuo (runs, eventos, auditoria) têm política de retenção declarada e
  job de expurgo. Retenção "definir depois" é retenção infinita.
- Expurgo de run remove também os artefatos associados no object storage, ou a conta cresce sozinha.

---

## Checklist

- [ ] Nenhum blob no banco; artefato por ponteiro + hash
- [ ] PK `UUID` da aplicação; timestamps `TIMESTAMPTZ` UTC
- [ ] FK indexada, `ON DELETE` declarado, unicidade de negócio no banco
- [ ] Chave de idempotência com `UNIQUE`
- [ ] SQLAlchemy só no repositório; transação aberta no serviço
- [ ] `lazy="raise"`; carregamento explícito; listagem por projeção paginada
- [ ] Índice novo justificado; `EXPLAIN ANALYZE` no PR quando aplicável
- [ ] Migration com `upgrade` e `downgrade` testados; compatível com a release anterior
- [ ] `CREATE INDEX CONCURRENTLY` em tabela grande; migration aplicada nunca editada
- [ ] Política de retenção e expurgo declarada, incluindo artefatos
