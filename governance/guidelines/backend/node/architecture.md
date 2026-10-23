# Arquitetura — Backend Node / Express

> Materialização de [`_shared/architecture-principles.md`](../../_shared/architecture-principles.md)
> em Node + Express + TypeScript. Este serviço é o "core" chamado pelo BFF Next.js
> ([`frontend/_shared/spa-bff.md`](../../frontend/_shared/spa-bff.md)) — não é o BFF, não serve
> a SPA, não fala com o browser diretamente.

## 1. Padrão

Screaming Architecture, mesma lógica de `backend/java/architecture.md`: a árvore de pastas
mostra os domínios de negócio (`cliente`, `sessao`), não o framework.

## 2. Estrutura de pastas

```
src/
├── config/                     # Config tipada e validada no startup (env, porta, segredo de sessão)
├── core/                       # Erros de negócio nomeados, compartilhados entre domínios
├── <dominio>/                  # cliente, sessao
│   ├── routes.ts               # Express Router — parsing (Zod) e delegação, zero regra de negócio
│   ├── service.ts              # 100% da regra de negócio
│   ├── repository.ts           # Acesso a `node:sqlite` — único lugar que importa o driver
│   └── model.ts                # Tipos TS imutáveis de request/response
├── middlewares/
│   ├── error-handler.ts        # Handler global — traduz erro nomeado em Problem Details
│   └── request-id.ts           # Gera/propaga X-Correlation-Id
├── db/
│   ├── connection.ts           # Abre a `DatabaseSync` de `node:sqlite`
│   └── migrations/             # Scripts SQL numerados, aplicados por `npm run migrate`
└── app.ts                      # Monta o Express app (sem side-effect de rede — usado nos testes)
src/server.ts                   # `app.listen()` — único ponto que sobe o processo

test/
└── <dominio>/{routes,service,repository}.test.ts
```

## 3. Regras de dependência

| Camada | Pode importar | Não pode importar |
|---|---|---|
| `routes` | `service`, `model` | `repository` diretamente |
| `service` | `repository`, `model`, `core` | `routes` |
| `repository` | driver `node:sqlite`, `model` | `service`, `routes` |
| `config` | nada de domínio | — |

**Regra crítica:** a linha crua lida do SQLite (`Record<string, unknown>` que o driver devolve)
nunca sai do `repository`: o mapeamento para o tipo de `model` acontece ali, antes de retornar ao
`service`.

## 4. Persistência e migrations

- Conexão única (`DatabaseSync` de `node:sqlite`) aberta em `db/connection.ts`, reusada por todos
  os repositories — sem pool (SQLite é um arquivo único, não há benefício em várias conexões de
  escrita concorrente nesta escala de demo).
- Migrations são scripts `.sql` numerados em `src/db/migrations/<NNN>_descricao.sql`, aplicados em
  ordem por um script (`npm run migrate`) que mantém uma tabela `_migrations` com o que já rodou.
  Sem Flyway nem esteira — fora de escopo desta demo (ver [`definition-of-done.md`](definition-of-done.md)).
- Migration aplicada nunca é editada; correção é migration nova, mesma regra do `backend/java`.
- Constraint declarativa (`UNIQUE`, `NOT NULL`, `CHECK`, `FOREIGN KEY`) sempre que a regra couber
  nela — mesmo princípio de `backend/java/database.md`, sem o aparato de Flyway/privilégio por
  usuário de banco (irrelevante num arquivo SQLite local de uso único).

## 5. Padrões táticos

- **Tipos imutáveis** — `model.ts` só exporta `type`, nunca `interface` mutável com setter; sem
  classes para DTO.
- **Erros de negócio nomeados** — classes em `core/errors.ts` (ex.: `RegraNegocioError`,
  `RecursoNaoEncontradoError`, `ConflitoError`), cada uma carregando o status HTTP e o
  `codigoRegra` quando aplicável (mesmo contrato de
  [`_shared/api-standards.md`](../../_shared/api-standards.md) §3). `error-handler.ts` é o único
  lugar que monta o corpo `application/problem+json`.
- **Validação de entrada** — todo `routes.ts` valida `body`/`query`/`params` com um schema Zod
  antes de chamar o `service`; falha de schema vira `400` com `errors[{ field, message }]`
  (mensagem do próprio schema Zod, em português).
- **Sessão (login)** — `sessao/service.ts` gera um id opaco (`crypto.randomBytes(32)`) e grava em
  tabela própria (`sessoes`), nunca em JWT local nem em cookie — a entrega do cookie ao browser é
  responsabilidade do BFF Next.js, não desta API (ver [SDR-001](../../../../docs/decisions/SDR-001-autenticacao-simplificada-sem-rhsso.md)).
  Senha: hash `scrypt` (`node:crypto`), nunca texto plano, nunca logado.
- **Correlação** — todo request recebe/propaga `X-Correlation-Id` (middleware
  `request-id.ts`), ecoado no log e no corpo de erro (`traceId`).
- **Rota versionada** — prefixo `/v1` em todas as rotas de domínio, mesma regra de
  [`_shared/api-standards.md`](../../_shared/api-standards.md) §1.

## 6. Uso pela IA (protocolo)

- "Crie o domínio `cliente` seguindo `backend/node/architecture.md`: schema Zod e rota em
  `cliente/routes.ts`, regra em `cliente/service.ts`, SQL em `cliente/repository.ts`."
- Revisão: "Verifique se `repository.ts` vazou tipo de linha crua do SQLite para o `service`, ou
  se há regra de negócio em `routes.ts`."

## Checklist

- [ ] Domínio isolado em `src/<dominio>/` com as 4 partes (`routes`, `service`, `repository`, `model`)
- [ ] Nenhuma linha crua do SQLite retornada pelo `service`; mapeamento no `repository`
- [ ] Regras de dependência entre camadas respeitadas
- [ ] Erros de negócio nomeados em `core/errors.ts`; `error-handler.ts` é o único montador de Problem Details
- [ ] Toda rota valida entrada com Zod antes do `service`
- [ ] Senha com hash `scrypt`; sessão por id opaco, nunca JWT local nem cookie montado nesta API
- [ ] Rota versionada `/v1`; `X-Correlation-Id` propagado
