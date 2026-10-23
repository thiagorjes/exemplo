# Modelo de Dados — cadastro-clientes

> Fonte única de verdade do esquema. A TechSpec principal só resume e linka para cá.
> Banco: SQLite em arquivo (`data/app.db`), via `node:sqlite` (`DatabaseSync`), conforme
> `governance/guidelines/backend/node/stack.md` e `architecture.md` §4.

---

## Decisão de modelagem — uma tabela `clientes` com discriminador, não duas tabelas

**Decisão:** uma única tabela `clientes`, com coluna `tipo` (`PF` | `PJ`) e colunas
específicas de cada tipo como nullable, em vez de `clientes_pf` + `clientes_pj` separadas.

**Por quê:** RF-008 (busca/lista) precisa listar PF e PJ juntos numa mesma tabela (T3 Lista de
clientes não distingue abas por tipo); com duas tabelas, toda consulta de listagem exigiria
`UNION`, e a constraint de unicidade de documento (RN-007 — CPF ou CNPJ já cadastrado bloqueia
novo cadastro) teria que ser verificada nas duas tabelas em vez de uma `UNIQUE` simples. Para a
escala desta demo (dezenas de registros), o custo de colunas nullable não compensa a
simplicidade perdida.

**Alternativa descartada:** `clientes_pf` + `clientes_pj` normalizadas, cada uma só com suas
colunas obrigatórias (sem nullable). Descartada pelo motivo acima — correto em escala de
produção com milhões de linhas e necessidade de evoluir os dois tipos de forma independente,
desproporcional para uma demonstração.

## Decisão de modelagem — exclusão lógica, apesar de "definitiva" no produto

RN-009 diz que a exclusão de cliente é definitiva **no produto** — não existe ação de
reativação em nenhuma tela. Mas a Regra de borda #4 de `/solution`
(`docs/solution/cadastro-clientes-solution.md`) exige que o sistema diferencie "cliente nunca
existiu" de "cliente existiu e foi excluído" ao tentar editar/excluir de novo (SCN-007.2). Isso
só é possível se a linha continuar existindo com uma marca de exclusão (`excluido_em`), em vez
de um `DELETE` físico que apaga todo rastro. Por isso: **exclusão lógica no banco, sem nenhuma
funcionalidade de reativação na API ou na UI** — as duas decisões não se contradizem.

---

## Tabelas

### `usuarios`

| Coluna | Tipo | Constraint | Observação |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUID v4, gerado pela aplicação (`crypto.randomUUID()`) |
| `cpf` | `TEXT` | `NOT NULL UNIQUE` | Só dígitos (11), validado por Zod antes de chegar aqui (RN-002) |
| `senha_hash` | `TEXT` | `NOT NULL` | `scrypt` (`node:crypto`), nunca a senha em texto plano (RN-003 exige só tamanho mínimo 8 — a validação de tamanho é na camada de schema, o hash é sempre aplicado) |
| `papel` | `TEXT` | `NOT NULL CHECK (papel IN ('admin_global','usuario'))` | RN-001, RN-006 |
| `criado_em` | `TEXT` | `NOT NULL` | ISO 8601 UTC |

Índice: `UNIQUE` em `cpf` já cria o índice (SQLite). Ciclo de vida: criado só por `POST
/v1/usuarios` (admin global); sem `UPDATE`/`DELETE` expostos nesta entrega (fora de escopo —
Shape Brief).

### `clientes`

| Coluna | Tipo | Constraint | Observação |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUID v4 |
| `tipo` | `TEXT` | `NOT NULL CHECK (tipo IN ('PF','PJ'))` | Decide quais colunas abaixo são exigidas na camada de validação (Zod discriminated union) |
| `documento` | `TEXT` | `NOT NULL UNIQUE` | CPF (11 dígitos) se `tipo='PF'`, CNPJ (14 dígitos) se `tipo='PJ'` — só dígitos (RN-007) |
| `nome_completo` | `TEXT` | `NULL` | Obrigatório na validação quando `tipo='PF'` (RN-010) |
| `data_nascimento` | `TEXT` | `NULL` | Obrigatório quando `tipo='PF'` (RN-010); ISO 8601 data |
| `nome_fantasia` | `TEXT` | `NULL` | Obrigatório quando `tipo='PJ'` (RN-011) |
| `razao_social` | `TEXT` | `NULL` | Obrigatório quando `tipo='PJ'` (RN-011) |
| `data_abertura` | `TEXT` | `NULL` | Obrigatório quando `tipo='PJ'` (RN-011); ISO 8601 data |
| `endereco` | `TEXT` | `NOT NULL` | Obrigatório nos dois tipos (RN-010, RN-011) |
| `telefone` | `TEXT` | `NOT NULL` | Obrigatório nos dois tipos (RN-010, RN-011) |
| `criado_em` | `TEXT` | `NOT NULL` | ISO 8601 UTC |
| `atualizado_em` | `TEXT` | `NOT NULL` | Atualizado a cada `PUT` (RF-006) |
| `excluido_em` | `TEXT` | `NULL` | `NULL` = ativo; preenchido = excluído (RN-009 + Regra de borda #4) |

Índices: `UNIQUE` em `documento` (índice automático); índice em `excluido_em` para a listagem
(RF-008) filtrar só os ativos sem varrer a tabela inteira.

**Ciclo de vida:** inexistente → ativo (`POST /v1/clientes`, `excluido_em IS NULL`) → excluído
(`DELETE /v1/clientes/:id`, seta `excluido_em`, nunca reseta). Edição (`PUT`) só é aceita com
`excluido_em IS NULL`.

### `socios`

| Coluna | Tipo | Constraint | Observação |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | UUID v4 |
| `cliente_id` | `TEXT` | `NOT NULL REFERENCES clientes(id)` | Só populada quando o cliente é `PJ` (RN-008, RN-011) |
| `nome_completo` | `TEXT` | `NOT NULL` | |
| `cpf` | `TEXT` | `NOT NULL` | Só dígitos |

Constraint técnica (não é regra de negócio numerada do PRD, é integridade de dado):
`UNIQUE(cliente_id, cpf)` — o mesmo CPF não aparece duas vezes na lista de sócios do mesmo
cliente. Índice em `cliente_id` para buscar os sócios de um cliente.

**Ciclo de vida:** criados junto com o cliente PJ (mesma transação) ou adicionados/removidos
durante uma edição (RF-006); removidos fisicamente (`DELETE`) quando o cliente é excluído
(`ON DELETE` não é usado — a exclusão de cliente é lógica, então os sócios permanecem
associados ao registro excluído, sem ficar órfãos).

### `sessoes`

| Coluna | Tipo | Constraint | Observação |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Id opaco, `crypto.randomBytes(32).toString('hex')` — nunca JWT (ver `backend/node/architecture.md` §5 e SDR-001) |
| `usuario_id` | `TEXT` | `NOT NULL REFERENCES usuarios(id)` | |
| `criado_em` | `TEXT` | `NOT NULL` | ISO 8601 UTC |
| `ultima_atividade_em` | `TEXT` | `NOT NULL` | Atualizada (`touch`) a cada request autenticado — base do cálculo de expiração (RN-004) |
| `encerrada_em` | `TEXT` | `NULL` | `NULL` = sessão pode estar ativa; preenchida = logout explícito (RF-009) |

Índice em `usuario_id`. **Sessão válida** = `encerrada_em IS NULL AND (agora - ultima_atividade_em) < 5 minutos`
(RN-004). Expiração é calculada na leitura (sem job de limpeza nesta demo — pendência não
bloqueante, ver Seção 10 da TechSpec); uma sessão expirada por tempo, mesmo sem `encerrada_em`
preenchido, é tratada como inválida pela mesma checagem que valida `encerrada_em`.

---

## Migrations

`src/db/migrations/`, aplicadas em ordem por `npm run migrate`, cada uma registrada na tabela
`_migrations` (nome do script + timestamp de aplicação), conforme
`backend/node/architecture.md` §4.

| Arquivo | Conteúdo |
|---|---|
| `001_create_table_usuarios.sql` | `CREATE TABLE usuarios (...)` conforme acima |
| `002_create_table_clientes.sql` | `CREATE TABLE clientes (...)` conforme acima |
| `003_create_table_socios.sql` | `CREATE TABLE socios (...)`, FK para `clientes` |
| `004_create_table_sessoes.sql` | `CREATE TABLE sessoes (...)`, FK para `usuarios` |

Migration aplicada nunca é editada — correção futura é migration nova (mesma regra de
`backend/java/database.md`, materializada sem o aparato de Flyway/privilégio por usuário de
banco, irrelevante num arquivo SQLite local de uso único, conforme
`backend/node/architecture.md` §4).

## Seed inicial (fora da migration)

Não há carga de dados inicial nesta demo: o primeiro admin global é criado por um script de
setup (`npm run seed`, fora das migrations — migrations são só schema) documentado em
`quickstart.md`, para destravar o primeiro login sem depender de um admin global pré-existente
que, por definição, ninguém ainda pode criar pela própria aplicação.
