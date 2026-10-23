# Contrato — Sessão

> API Node (`/v1/sessoes`). Consumida só pelo BFF Next.js (`app/api/*`), nunca pelo browser
> diretamente (`frontend/_shared/spa-bff.md` §1). Materializa RF-001, RF-009, RN-001 a RN-006.

## `POST /v1/sessoes` — Login

- **Request:** `{ cpf: string, senha: string }`
- **201 Created** — `Location: /v1/sessoes/{id}` — corpo: `{ id, usuarioId, papel, criadoEm }`
  (nunca `senha`/`senhaHash`)
- **401** (`type: urn:cadastro-clientes:erro:nao-autenticado`) — combinação incorreta **ou**
  CPF sem usuário — mesma resposta nos dois casos (RF-001, SCN-001.2). Sem `codigoRegra`: não é
  regra de negócio, é autenticação.
- **400** — `cpf`/`senha` ausentes ou fora do formato esperado (`errors[]`)

## `GET /v1/sessoes/{id}` — Validar/renovar sessão (uso interno do BFF)

Chamada pelo BFF a cada request autenticado proxiado, para confirmar validade e fazer `touch`
(atualizar `ultima_atividade_em`) — RN-004.

- **200** — `{ id, usuarioId, papel, ultimaAtividadeEm }` — sessão válida (`encerrada_em IS NULL`
  e dentro da janela de RN-004, `SESSION_IDLE_TIMEOUT_MS`); a própria chamada atualiza
  `ultima_atividade_em`
- **401** (`type: urn:cadastro-clientes:erro:nao-autenticado`) — sessão inexistente, encerrada
  (logout) ou expirada por inatividade (RF-001 SCN-001.3). O BFF, ao receber este `401`, invalida
  o cookie e redireciona para `/login` (`frontend/_shared/spa-bff.md` §3, linha "401")

## `DELETE /v1/sessoes/{id}` — Logout

- **204 No Content** — sempre, inclusive quando a sessão já estava encerrada ou expirada
  (RF-009, SCN-009.2 e SCN-009.3 — idempotente por design, nunca erro)

## Regras aplicadas aqui

| RN | Onde aparece neste contrato |
|---|---|
| RN-004 (sessão expira por inatividade) | `GET /v1/sessoes/{id}` recusa com `401` se `agora - ultima_atividade_em >= SESSION_IDLE_TIMEOUT_MS` (padrão 300000ms/5min; 30000ms/30s no ambiente de e2e) |
| RN-005 (operação de cliente exige sessão) | Todo contrato em `cliente.md` e `usuario.md` depende de `GET /v1/sessoes/{id}` ter respondido `200` antes |
| RN-006 (criação/listagem de usuário só por admin global) | `papel` retornado aqui é o que `usuario.md` confere antes de autorizar |
