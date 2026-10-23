# Oracle — Backend Java

> Usado quando a demanda declarar Oracle (em geral, sistemas que já estão nele). Regras gerais
> (migrations, N+1, projeções, transação): [`database.md`](database.md). Esta página só traz o
> que é próprio do Oracle.

## 1. Dependências

| Artefato | Versão | Escopo |
|---|---|---|
| `com.oracle.database.jdbc:ojdbc11` | gerenciado pelo Boot | `runtime` |
| `org.flywaydb:flyway-database-oracle` | gerenciado pelo Boot | `compile` |

## 2. Tipos

| Java | Oracle | Observação |
|---|---|---|
| `Long` (id, FK) | `NUMBER(19)` | |
| `Integer` | `NUMBER(10)` | no H2 é `INTEGER`; `SMALLINT` no H2 quebra o `ddl-auto=validate` |
| `BigDecimal` (dinheiro) | `NUMBER(p,s)` | |
| `String` | `VARCHAR2(n CHAR)` | tamanho em caracteres, não em bytes |
| `Instant` | `TIMESTAMP(6) WITH TIME ZONE` | |
| `LocalDate` | `DATE` | |

- String vazia é gravada como `NULL`: coluna `NOT NULL` recusa `''`, e a validação do record
  trata vazio como ausente.

## 3. Identificadores gerados

- Sequence com `INCREMENT BY` igual ao `allocationSize` do `@SequenceGenerator`.

## 4. Regra que lê outras linhas

- Prefira **índice único baseado em função** quando ele resolver (ex.: unicidade condicional).
- Se precisar de trigger, use **trigger composta** (compound trigger): trigger de linha que
  consulta a própria tabela falha com ORA-04091 (tabela em mutação) em todo UPDATE.
- Índice por função, trigger e PL/SQL são recursos exclusivos: teste no `oracle-it` (INSERT
  **e** UPDATE).

## 5. Trava pessimista

- O timeout pedido (`jakarta.persistence.lock.timeout`) vira `FOR UPDATE WAIT n`. O H2 ignora o
  `WAIT`, então esse comportamento tem teste próprio no `oracle-it`.

## 6. Ordenação e H2

- O Oracle trata nulo como o maior valor: em `asc` vem por último. Declare a precedência mesmo
  assim.
- URL do H2 dos testes: `jdbc:h2:mem:<nome>;MODE=Oracle;DEFAULT_NULL_ORDERING=HIGH`
  (mais o `LOCK_TIMEOUT` do teste de trava).

## 6.1 Privilégio por coluna e papéis (a confirmar)

A regra geral está em [`database.md`](database.md) §1. O padrão (placeholder `${so_banco_real}`,
usuário da esteira dono dos objetos, um usuário de aplicação com `GRANT`) foi exercitado só com
PostgreSQL; neste banco ainda **não foi verificado**. Pontos a conferir no primeiro uso: privilégio
de coluna só existe para `UPDATE`, `INSERT` e `REFERENCES` (`SELECT` por coluna exige *view*); o
schema é o usuário dono, então a aplicação precisa de sinônimos ou de `CURRENT_SCHEMA`; erros de
privilégio negado são `ORA-01031` e `ORA-00942`; sem aspas o Oracle converte o nome para
**maiúsculas** (o inverso do PostgreSQL), então nome criado entre aspas em minúsculas só é achado
entre aspas.

## 7. Teste de integração

Perfil Maven `oracle-it`, fora do `verify` padrão, contra o Oracle de homologação. Segue as
regras de [`testing.md`](testing.md) §4.

## Checklist

- [ ] Driver e módulo Flyway do Oracle, versões do Boot
- [ ] Tipos conforme a tabela; `VARCHAR2` em caracteres; string vazia tratada como ausente
- [ ] Índice por função antes de trigger; trigger que lê a própria tabela é composta
- [ ] `FOR UPDATE WAIT n` e recursos exclusivos testados no `oracle-it`
