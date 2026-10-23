# PostgreSQL — Backend Java

> Banco **padrão** dos sistemas novos. Regras gerais (migrations, N+1, projeções, transação):
> [`database.md`](database.md). Esta página só traz o que é próprio do PostgreSQL.

## 1. Dependências

| Artefato | Versão | Escopo |
|---|---|---|
| `org.postgresql:postgresql` | gerenciado pelo Boot | `runtime` |
| `org.flywaydb:flyway-database-postgresql` | gerenciado pelo Boot | `compile` |

## 2. Tipos

| Java | PostgreSQL | Observação |
|---|---|---|
| `Long` (id, FK) | `bigint` | |
| `Integer` | `integer` | |
| `BigDecimal` (dinheiro) | `numeric(p,s)` | escala fixa, nunca `real`/`double precision` |
| `String` | `varchar(n)` | `n` igual ao limite validado no record; `text` vira CLOB no H2 e quebra o `ddl-auto=validate` |
| `Short` | `smallint` | |
| `byte[]` | `bytea` | tamanho em bytes por `octet_length(coluna)` |
| `Boolean` | `boolean` | |
| `Instant` | `timestamptz` | instante em UTC |
| `LocalDate` | `date` | data sem hora |
| `UUID` | `uuid` | |

- `jsonb`, array e tipo de intervalo (`daterange`) não rodam no H2: só com teste `postgresql-it`
  e quando nenhum tipo comum resolver.
- Comparação de texto diferencia maiúsculas: unicidade de e-mail ou nome sem diferenciar caixa
  grava o valor normalizado (minúsculo) numa coluna com `UNIQUE`, que roda também no H2.
- Identificadores sem aspas, em `snake_case` minúsculo, até 63 caracteres (nome de constraint e
  de índice inclusive).

## 3. Identificadores gerados

- `GenerationType.SEQUENCE` com `@SequenceGenerator(allocationSize = N)` e a sequence criada na
  migration com `INCREMENT BY N`: valores diferentes quebram a validação do Hibernate.
- Evitar `IDENTITY`: desliga o batch insert do Hibernate.

## 4. Regra que lê outras linhas

| Regra | Recurso |
|---|---|
| Unicidade condicional (um registro ativo por chave) | índice único parcial (`CREATE UNIQUE INDEX ... WHERE ativo`) |
| Não sobreposição de vigências | exclusion constraint (`EXCLUDE USING gist (chave WITH =, daterange(inicio, fim, '[]') WITH &&)`) |

- Os dois são recursos exclusivos: teste no `postgresql-it` (INSERT e UPDATE).
- A exclusion constraint com coluna comum exige a extensão `btree_gist`. Criar extensão depende
  de privilégio: confirmar com o DBA antes do plano, não presumir.
- Trigger PL/pgSQL que consulta a própria tabela não impede duas transações simultâneas de
  passarem pela verificação; por isso o recurso declarativo vem antes.

## 5. Trava pessimista

- O PostgreSQL não tem `FOR UPDATE WAIT n` (só `NOWAIT` e `SKIP LOCKED`); a dica
  `jakarta.persistence.lock.timeout` não garante espera limitada.
- O timeout vem de `lock_timeout`, aplicado na transação que trava (`SET LOCAL lock_timeout`
  antes da consulta com trava), em milissegundos vindos de `@ConfigurationProperties`.
- Estouro do tempo (SQLState `55P03`) é traduzido como as demais falhas de trava.

## 6. Ordenação e H2

- O PostgreSQL trata nulo como o maior valor: em `asc` vem por último, como pede
  [`../../_shared/api-standards.md`](../../_shared/api-standards.md). Declare a precedência
  mesmo assim.
- URL do H2 dos testes:
  `jdbc:h2:mem:<nome>;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`
  (mais o `LOCK_TIMEOUT` do teste de trava).

## 6.1 Privilégio por coluna e papéis

- `GRANT SELECT, INSERT ON tabela TO ${papel_app}` e, para escrita parcial,
  `GRANT UPDATE (coluna_a, coluna_b) ON tabela TO ${papel_app}`; o privilégio da retenção vai para o
  mesmo usuário (ou para `${papel_expurgo}`, se o DBA entregar um papel próprio). Usuário e papel são
  objetos do cluster: criados antes pelo DBA, não pela migration. As linhas de privilégio levam o
  prefixo `${so_banco_real}` ([`database.md`](database.md) §1).
- Privilégio negado devolve SQLState `42501` (*insufficient_privilege*); o teste `postgresql-it` o
  espera, com a conexão da aplicação, para cada operação que não deve passar.
- A aplicação não é dona das tabelas: o usuário da esteira cria; o da aplicação só recebe o `GRANT`.
  Se o usuário da aplicação for **dono do schema**, ele ainda pode apagar objetos do schema (`DROP`),
  embora não altere linhas sem `GRANT`: confirmar com o DBA quem é o dono do schema e registrar.
- **Caixa:** sem aspas o PostgreSQL converte o nome para minúsculas. Schema ou usuário criado entre
  aspas em maiúsculas (`"XYZ_SISTEMA"`) só é achado entre aspas: o valor de `${papel_app}` leva as
  aspas, e `DATABASE_SCHEMAS` usa a mesma caixa (o Flyway cita o nome do schema; caixa divergente faz
  ele procurar outro schema e tentar criá-lo, o que o usuário da esteira não pode). Conferir em
  `pg_namespace` e `pg_roles`.
- **Schema em maiúsculas na aplicação (medido):** `currentSchema` na URL **não** serve (vai sem aspas
  ao `search_path`, e o schema não é achado: `current_schema` nulo). Use `spring.datasource.hikari.schema`
  (o pgjdbc cita o nome no `setSchema`), o mesmo em qualquer pool próprio (ex.: o do expurgo), e
  `hibernate.default_schema` com o nome **entre aspas**: sem isso o `ddl-auto=validate` passa o schema
  para minúsculas ao ler os metadados e falha com *missing table*. O `postgresql-it` cria o schema de
  teste em maiúsculas para reproduzir.

## 7. Teste de integração

Perfil Maven `postgresql-it`, fora do `verify` padrão, contra o PostgreSQL de homologação. Segue
as regras de [`testing.md`](testing.md) §4: schema dedicado preparado pelo Flyway, sem carga de
dados, limpeza só do que o teste criou e evidência na entrega.

## Checklist

- [ ] Driver e módulo Flyway do PostgreSQL, versões do Boot
- [ ] Tipos conforme a tabela; dinheiro em `numeric(p,s)`, instante em `timestamptz`
- [ ] Sequence com `INCREMENT BY` igual ao `allocationSize`
- [ ] Unicidade condicional e não sobreposição por recurso declarativo, testados no `postgresql-it`
- [ ] Trava com `lock_timeout` na transação
- [ ] `GRANT` por tabela e por coluna com `${papel_app}` (e `${papel_expurgo}`, se houver) e `${so_banco_real}`; `42501` esperado no `postgresql-it`
- [ ] Schema e usuário na caixa do catálogo (entre aspas se maiúsculos); dono do schema confirmado com o DBA
- [ ] H2 em `MODE=PostgreSQL` com `DEFAULT_NULL_ORDERING=HIGH`
