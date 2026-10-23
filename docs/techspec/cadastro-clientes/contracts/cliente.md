# Contrato — Cliente

> API Node (`/v1/clientes`). Exige sessão válida (qualquer papel) — RN-005. Materializa RF-004 a
> RF-008.

## `POST /v1/clientes` — Incluir cliente (PF ou PJ)

- **Request (PF):** `{ tipo: 'PF', documento, nomeCompleto, dataNascimento, endereco, telefone }`
- **Request (PJ):** `{ tipo: 'PJ', documento, nomeFantasia, razaoSocial, dataAbertura, endereco, telefone, socios: [{ nomeCompleto, cpf }, ...] }`
- **201 Created** — `Location: /v1/clientes/{id}` — corpo: o cliente criado (mesmo formato do
  `GET` abaixo)
- **400** (`errors[]`) — campo obrigatório do tipo ausente/vazio (RN-010, RN-011, SCN-004.3); para
  PJ, `socios` ausente ou vazio entra aqui — é validação de schema (Zod `min(1)`), não regra de
  negócio (RN-008, SCN-005.3)
- **409** (`codigoRegra: RN-CLI-01`, `dadosApoio: { documento }`) — `documento` já pertence a
  outro cliente ativo (RN-007, SCN-004.2/SCN-005.2)

## `GET /v1/clientes` — Listar clientes ativos

- **200** — `[{ id, tipo, documento, ...campos do tipo, criadoEm, atualizadoEm }, ...]` — só
  `excluido_em IS NULL`; sem paginação nesta demo (RNF-004) (RF-008, SCN-008.1, SCN-008.2 — array
  vazio quando não há cliente)

## `GET /v1/clientes/{id}` — Obter um cliente (uso interno da tela de edição)

- **200** — o cliente, se `excluido_em IS NULL`
- **404** (`type: urn:cadastro-clientes:erro:nao-encontrado`) — id nunca existiu
- **410 Gone** (`type: urn:cadastro-clientes:erro:nao-encontrado`, `status: 410`) — id existiu e
  foi excluído (distinção exigida pela Regra de borda #4 de `/solution` — ver `data-model.md`,
  "Decisão de modelagem — exclusão lógica")

## `PUT /v1/clientes/{id}` — Editar cliente

- **Request:** mesmo formato do `POST` para o `tipo` do cliente (não permite trocar `tipo`)
- **200** — o cliente atualizado (RF-006, SCN-006.1)
- **400** — alteração deixaria campo obrigatório vazio (RN-010/RN-011, SCN-006.2)
- **404** / **410** — mesma regra do `GET /v1/clientes/{id}` (cobre o caminho alternativo de
  "cliente excluído por outra sessão entre localizar e confirmar")
- **Concorrência (SCN-006.3):** sem `versao`/`If-Match` nesta entrega — a última escrita
  prevalece, sem bloqueio nem aviso, conforme a Regra de borda #3 de `/solution` (decisão
  explícita, não omissão: controle de concorrência está fora do escopo aprovado)

## `DELETE /v1/clientes/{id}` — Excluir cliente

- **204 No Content** — mesmo se o cliente já estava excluído (`excluido_em` já preenchido) —
  idempotente por design, sem erro (RF-007, SCN-007.2)
- **404** — id nunca existiu

> Nenhuma rota de reativação. `excluido_em` preenchido é estado final para qualquer cliente
> nesta API (RN-009).

> **Por que `DELETE` não usa 410 como `GET`/`PUT`:** é uma escolha deliberada, não uma
> inconsistência — `DELETE` sobre um recurso já excluído é o caso clássico de idempotência REST
> (chamar de novo não piora nada, então responde sucesso); `GET`/`PUT` precisam que quem chamou
> saiba que não há mais o que ler ou editar, por isso diferenciam "nunca existiu" de "já não
> existe mais" com `404`/`410`. A UI usa o status de cada chamada para decidir a mensagem — sem
> mecanismo adicional de detecção além do status HTTP recebido.
