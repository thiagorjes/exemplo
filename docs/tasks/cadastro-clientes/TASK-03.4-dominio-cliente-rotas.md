### TASK-03.4 — Domínio cliente: rotas de inclusão e listagem [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.3, TASK-02.1
- **Cenários cobertos:** SCN-004.1, SCN-004.2, SCN-004.3, SCN-005.1, SCN-005.2, SCN-005.3, SCN-008.1, SCN-008.2
- **Origem:** `docs/techspec/cadastro-clientes/contracts/cliente.md` (`POST /v1/clientes`, `GET /v1/clientes`)

#### Contexto

Expõe `incluirCliente` e `listarClientes` como rotas HTTP. As rotas `GET /:id`, `PUT /:id` e
`DELETE /:id` são acrescentadas a este mesmo arquivo pelo EPIC-04 — não são criadas aqui de
propósito, para manter o PR desta task do tamanho do que ele entrega.

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/routes.ts`, com o middleware `exigirSessao` (de
      `backend/src/middlewares/autenticacao.ts`, TASK-02.1) aplicado a **todas** as rotas
      deste domínio — qualquer papel autenticado pode operar cliente (RN-005; diferente de
      `usuario.md`, aqui **não** se aplica `exigirAdminGlobal`):
      - `POST /` — valida o corpo com `clienteSchema` (`400` com `errors[]` se inválido);
        chama `incluirCliente`; sucesso: `201`, `Location: /v1/clientes/{id}`, corpo do
        cliente criado; conflito: `409` com `codigoRegra: "RN-CLI-01"`, `dadosApoio: {
        documento }`
      - `GET /` — chama `listarClientes`; `200` com o array (vazio se não houver nenhum)
- [ ] Montar o router de `cliente` em `backend/src/app.ts` sob o prefixo `/v1/clientes`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/routes.ts` | criar | `POST /`, `GET /` (só isso nesta task) |
| `backend/src/app.ts` | alterar | monta o router em `/v1/clientes` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/cliente.md` (seções `POST
/v1/clientes` e `GET /v1/clientes`, literal) e `backend/src/usuario/routes.ts` (TASK-02.1,
mesmo padrão de middleware + Zod + tradução de erro).

#### Guia técnico — pontos de atenção

- Só `exigirSessao`, nunca `exigirAdminGlobal`, nas rotas de cliente — RN-005 exige sessão,
  não papel específico.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /v1/clientes` com o payload PF do exemplo RF-004 de `quickstart.md` devolve `201` | `curl` |
| 2 | `POST /v1/clientes` com o payload PJ (com sócio) do exemplo RF-005 devolve `201` com `socios` no corpo | `curl` |
| 3 | `GET /v1/clientes` em banco sem nenhum cliente devolve `200` com array vazio | `curl` em ambiente recém-migrado |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; `GET /:id`, `PUT /:id`, `DELETE /:id` deliberadamente fora — ver EPIC-04. |
