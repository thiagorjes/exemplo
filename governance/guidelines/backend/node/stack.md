# Stack — Backend Node

> **Stack de exceção.** A stack padrão e obrigatória do workspace é `backend/java` (Java +
> Spring Boot). Esta coleção existe só para sistemas que registrarem o mesmo desvio em ADR
> próprio — ver [`ADR-001`](../../../../docs/decisions/ADR-001-backend-node-para-demo-idsd.md),
> que a originou para a demonstração do flow IDSD. Novo sistema que queira usar `backend/node`
> precisa do seu próprio ADR; esta coleção não dispensa o registro.

## Linguagem

| Linguagem | Versão | Uso |
|---|---|---|
| TypeScript | 5.9.2 | Toda a aplicação, `strict: true` no `tsconfig.json` |
| Node.js | 24 LTS (24.22.1, fixado em `.nvmrc`) | Runtime |

## Framework principal

| Biblioteca | Versão | Finalidade |
|---|---|---|
| Express | 5.1.0 | Roteamento HTTP e middlewares |
| Zod | 4.0.0 | Validação de schema de request (body, query, params) |
| `node:sqlite` (`node:sqlite` core, sem dependência externa) | nativo do Node 24 | Persistência — `DatabaseSync` |
| Pino | 9.6.0 | Logging estruturado (JSON) |
| `node:crypto` (core) | nativo do Node 24 | Hash de senha (`scrypt`) e geração de sessão (`randomBytes`) |

> **Por que `node:sqlite` e não `better-sqlite3`:** o módulo nativo evita dependência compilada
> (sem `node-gyp`, sem binário por plataforma) — relevante para uma demo que deve rodar com
> `npm install` puro em qualquer máquina. Trade-off aceito: API um pouco mais crua que
> `better-sqlite3`; para o volume de dados de uma demo isso não pesa.

## Bibliotecas proprietárias

Nenhuma. Esta coleção não usa libs internas do Nexus corporativo — ver
[`_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md) §2
para a política, que só se aplica quando houver lib proprietária em uso.

## Banco de dados

**SQLite em arquivo** (`data/app.db`), via `node:sqlite`. Detalhe de migrations e regras de
persistência: [`architecture.md`](architecture.md) §4. Fora desta coleção (produção real) exige
o banco padrão do workspace (PostgreSQL, ver `backend/java/stack.md`) e ADR próprio.

## Build e qualidade

| Ferramenta | Versão | Finalidade |
|---|---|---|
| TypeScript Compiler (`tsc`) | 5.9.2 | Build (`dist/`) |
| ESLint | 9.17.0 (`typescript-eslint` 8.19.0) | Lint |
| Prettier | 3.4.2 | Formatação |
| `npm audit` (`npm` 10.9.x, incluso no Node 24) | — | SCA mínimo (ver [`definition-of-done.md`](definition-of-done.md) — substitui o SCA corporativo, fora de escopo nesta demo) |

## Testes

| Ferramenta | Versão | Uso |
|---|---|---|
| Jest | 29.7.0 (`ts-jest` 29.2.5) | Framework de testes |
| Supertest | 7.0.0 | Teste de contrato HTTP das rotas Express |

## Infraestrutura

Execução local apenas (`npm run build && npm start`), sem implantação em OpenShift nem pipeline
corporativo — fora de escopo desta demo (ver [`definition-of-done.md`](definition-of-done.md)).
Variáveis de ambiente lidas de `.env` local (nunca commitado) via config tipada
([`architecture.md`](architecture.md) §3); `.env.example` documenta as chaves esperadas.

## Checklist

- [ ] Versões desta tabela usadas exatamente (sem range, sem "latest")
- [ ] Nenhuma lib proprietária do Nexus introduzida sem atualizar esta tabela e
      `_shared/vulnerable-and-proprietary-libs.md`
- [ ] Novo sistema que adote esta coleção registra o próprio ADR de desvio da stack padrão
