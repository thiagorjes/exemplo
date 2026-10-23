# MySQL — Backend Java

> Usado quando a demanda declarar MySQL. Regras gerais (migrations, N+1, projeções, transação):
> [`database.md`](database.md). Esta página só traz o que é próprio do MySQL (8.0.16 ou superior,
> versão a partir da qual `CHECK` é aplicado).

## 1. Dependências

| Artefato | Versão | Escopo |
|---|---|---|
| `com.mysql:mysql-connector-j` | gerenciado pelo Boot | `runtime` |
| `org.flywaydb:flyway-mysql` | gerenciado pelo Boot | `compile` |

## 2. Tabelas e tipos

- InnoDB, `utf8mb4`. A collation padrão (`utf8mb4_0900_ai_ci`) **não diferencia maiúsculas nem
  acentos**: "José" e "jose" colidem num índice único e se igualam no `WHERE`. Se a regra exigir
  diferenciar, a coluna declara a collation (`utf8mb4_0900_as_cs`). Como o H2 diferencia por
  padrão, regra que depende de collation tem teste no `mysql-it`.

| Java | MySQL | Observação |
|---|---|---|
| `Long` (id, FK) | `BIGINT` | |
| `Integer` | `INT` | |
| `BigDecimal` (dinheiro) | `DECIMAL(p,s)` | nunca `FLOAT`/`DOUBLE` |
| `String` | `VARCHAR(n)` | `n` igual ao limite validado no record |
| `Boolean` | `BOOLEAN` (`TINYINT(1)`) | |
| `Instant` | `DATETIME(6)` em UTC | `TIMESTAMP` acaba em 2038 e converte pelo fuso da sessão |
| `LocalDate` | `DATE` | |

- Instante gravado em UTC: `spring.jpa.properties.hibernate.jdbc.time_zone=UTC`.
- Identificadores em `snake_case` minúsculo (nome de tabela diferencia caixa no Linux), até 64
  caracteres.

## 3. Identificadores gerados

- Sem sequence: `GenerationType.IDENTITY` com `AUTO_INCREMENT`. Isso desliga o batch insert
  dessas entidades, e é aceito; o batch continua valendo para update.
- Nunca `GenerationType.TABLE`.

## 4. Migrations

- DDL no MySQL faz commit implícito: migration que falha no meio deixa o schema pela metade, e o
  Flyway não desfaz. **Uma mudança de schema por migration**, para a correção ser uma migration
  nova e pequena.

## 5. Regra que lê outras linhas

| Regra | Recurso |
|---|---|
| Unicidade condicional (um registro ativo por chave) | coluna gerada (`GENERATED ALWAYS AS (CASE WHEN ativo THEN chave END)`) com índice único: nulos não colidem |
| Não sobreposição de vigências | não há recurso declarativo: verificação no service sob trava pessimista da linha-mãe (ou de uma linha de controle por chave), com teste de concorrência |

- Coluna gerada e trigger são recursos exclusivos: teste no `mysql-it` (INSERT e UPDATE).

## 6. Trava pessimista

- O MySQL não tem `FOR UPDATE WAIT n` (só `NOWAIT` e `SKIP LOCKED`).
- O timeout vem de `innodb_lock_wait_timeout`, em segundos, fixado na conexão pela propriedade
  `sessionVariables` do Connector/J (um `SET SESSION` avulso fica na conexão devolvida ao pool).
- Estouro do tempo (erro 1205) é traduzido como as demais falhas de trava.

## 7. Ordenação e H2

- Em `asc` o nulo vem **primeiro** e não há `NULLS LAST` no SQL: a consulta declara a precedência
  (`NULLS LAST` em JPQL ou `Sort.Order.nullsLast()`) e o Hibernate a emula, cumprindo
  [`../../_shared/api-standards.md`](../../_shared/api-standards.md).
- URL do H2 dos testes: `jdbc:h2:mem:<nome>;MODE=MySQL;DATABASE_TO_LOWER=TRUE`
  (mais o `LOCK_TIMEOUT` do teste de trava).

## 7.1 Privilégio por coluna e papéis (a confirmar)

A regra geral está em [`database.md`](database.md) §1. O padrão (placeholder `${so_banco_real}`,
usuário da esteira dono dos objetos, um usuário de aplicação com `GRANT`) foi exercitado só com
PostgreSQL; neste banco ainda **não foi verificado**. Pontos a conferir no primeiro uso: `GRANT UPDATE (coluna)` por coluna; o usuário da esteira precisa
de `GRANT OPTION`; DDL tem commit implícito (afeta a atomicidade dos `GRANT` na migration); códigos de
erro de privilégio negado diferentes do `42501` do PostgreSQL.

## 8. Teste de integração

Perfil Maven `mysql-it`, fora do `verify` padrão, contra o MySQL de homologação. Segue as regras
de [`testing.md`](testing.md) §4.

## Checklist

- [ ] Driver e módulo Flyway do MySQL, versões do Boot
- [ ] InnoDB + `utf8mb4`; collation decidida onde a regra depende de caixa ou acento
- [ ] Instante em `DATETIME(6)` UTC; dinheiro em `DECIMAL(p,s)`
- [ ] Uma mudança de schema por migration
- [ ] Unicidade condicional por coluna gerada; não sobreposição sob trava, com teste de concorrência
- [ ] `innodb_lock_wait_timeout` na conexão; precedência de nulos declarada na consulta
