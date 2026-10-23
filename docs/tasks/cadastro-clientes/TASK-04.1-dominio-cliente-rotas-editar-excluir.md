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
