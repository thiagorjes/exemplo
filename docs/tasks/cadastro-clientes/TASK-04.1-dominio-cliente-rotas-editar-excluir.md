### TASK-04.1 — Domínio cliente: rotas de obter, editar e excluir [api]

- **Status:** concluída
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
| `backend/src/cliente/routes.ts` | alterar | acrescenta `GET /:id`, `PUT /:id`, `DELETE /:id`; virou factory `criarClienteRouter(service, exigirSessaoMw)` — ver nota abaixo |
| `backend/src/middlewares/autenticacao.ts` | alterar | fora do escopo original — ver nota abaixo |
| `backend/src/app.ts` | alterar | fora do escopo original — ver nota abaixo |
| `backend/jest.config.js` | alterar | fora do escopo original — ver nota abaixo |
| `backend/test/setup.ts` | criar | fora do escopo original e dentro de `backend/test/` (normalmente proibido) — ver nota abaixo; não altera nenhum teste existente, só bootstrap de env |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, conteúdo dos testes já existentes em `backend/test/`.

> **Correção arquitetural cross-task (2026-10-23):** `backend/test/sessao/routes.test.ts` e
> `backend/test/cliente/routes.test.ts` (escritos em `/tests`) esperam `criarApp(deps)` com
> injeção de repository — documentado como achado pendente na TASK-01.3 à época, mas na
> verdade **já estava especificado** em
> `governance/guidelines/backend/node/testing.md` §2-3 (`criarApp({ clienteRepository })`,
> `criarXService(repo)`), só não em `architecture.md`. Implementado agora: `cliente/service.ts`
> virou `criarClienteService(repo: ClienteRepositorio)` (mantendo os 5 exports nomeados ligados
> ao repository real, para não quebrar nenhum import existente); `cliente/routes.ts` virou
> `criarClienteRouter(service, exigirSessaoMw)`; `middlewares/autenticacao.ts` ganhou
> `criarExigirSessao(validador)` (o `exigirSessao` do módulo continua existindo, ligado ao
> `validarSessao` real); `app.ts` virou `criarApp(deps?: { clienteRepository?, sessaoRepository?
> })`, com `export const app = criarApp()` preservado para `server.ts`. `RecursoNaoEncontradoError`
> (TASK-01.1) tinha `status = 404` fixo — passou a aceitar `status` no construtor (padrão 404),
> necessário para o `410` desta task. `backend/test/setup.ts` criado porque Jest não lê `.env`
> (só `node --env-file=.env` lê) — sem ele, `config/index.ts` (`process.exit(1)` em config
> ausente) derrubava qualquer teste que importasse `app.ts`, mesmo um teste que nunca toca o
> banco de verdade (repository é injetado). Não altera nenhuma asserção dos testes existentes,
> só define `PORT`/`DATABASE_PATH`/`SESSION_SECRET` antes de qualquer import — por isso foi
> criado apesar de estar dentro de `backend/test/`.
> Resultado: `cliente/routes.test.ts` (SCN-006.3) passa. `sessao/routes.test.ts` (SCN-009.3)
> continua falhando com `404` — correto e esperado, porque `DELETE /v1/sessoes/{id}` (logout)
> ainda não existe, é escopo do EPIC-05.

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
| 2026-10-23 | concluída (tentativa 1 de 3) | Checagem de imutabilidade de `tipo` (400) em `editarCliente`; rotas `GET/PUT/DELETE /:id` acrescentadas. Refatoração cross-task para `criarApp(deps)` (ver nota acima) — resolve o achado de DI pendente desde TASK-01.1/01.3. Critérios de aceite 1-3 confirmados via `curl` (200/404/400/204/204/410). `npm test`: `cliente/routes.test.ts` passa; `sessao/routes.test.ts` falha com 404 (esperado, `DELETE /v1/sessoes` é EPIC-05). `npx tsc --noEmit` limpo. `check_escopo.py --base HEAD` → ver nota sobre `backend/test/setup.ts`. |
