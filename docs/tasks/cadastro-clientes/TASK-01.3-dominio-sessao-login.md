### TASK-01.3 — Domínio sessão: login e validação [api]

- **Status:** concluída
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.2
- **Cenários cobertos:** SCN-001.1, SCN-001.2
- **Origem:** `docs/techspec/cadastro-clientes/contracts/sessao.md` (`POST`/`GET` apenas — o
  `DELETE` de logout é RF-009, entregue em EPIC-05 de propósito, porque nasceu de uma emenda
  posterior ao PRD original)

#### Contexto

Entrega o lado backend de RF-001 (login): criar sessão e validá-la. O logout (`DELETE`,
RF-009) fica fora desta task — tem épico próprio (EPIC-05) porque é uma emenda posterior ao
PRD, e misturá-lo aqui perderia a rastreabilidade de que essa parte do escopo chegou depois.

#### O que deve ser feito

- [ ] Criar `backend/src/sessao/model.ts`:
      ```ts
      export type Papel = 'admin_global' | 'usuario';
      export type SessaoCriada = { id: string; usuarioId: string; papel: Papel; criadoEm: string };
      export type SessaoValidada = { id: string; usuarioId: string; papel: Papel; ultimaAtividadeEm: string };
      ```
- [ ] Criar `backend/src/sessao/repository.ts`: `criarSessao(usuarioId: string): SessaoCriada`
      (gera `id = crypto.randomBytes(32).toString('hex')`, insere com `criado_em` e
      `ultima_atividade_em` = agora); `buscarSessaoPorId(id: string)`; `tocarSessao(id:
      string)` (atualiza `ultima_atividade_em` para agora)
- [ ] Criar `backend/src/sessao/service.ts`:
      - `login(cpf: string, senha: string): SessaoCriada` — busca usuário por `cpf`; se não
        existir OU `scrypt(senha) !== senha_hash`, lança erro de autenticação (401, sem
        `codigoRegra`, mensagem genérica — **a mesma** para os dois casos); senão cria e
        retorna a sessão
      - `validarSessao(id: string): SessaoValidada` — busca a sessão; se não existir, se
        `encerrada_em` estiver preenchido, ou se `(Date.now() - ultima_atividade_em) >= 5 *
        60 * 1000` (RN-004, 5 minutos), lança erro de autenticação (401); senão chama
        `tocarSessao(id)` e retorna os dados atualizados
- [ ] Criar `backend/src/sessao/routes.ts`:
      - `POST /` — valida `{ cpf: string, senha: string }` com Zod; chama `login`; sucesso:
        `201`, header `Location: /v1/sessoes/{id}`, corpo `{ id, usuarioId, papel, criadoEm
        }` (nunca senha/hash)
      - `GET /:id` — chama `validarSessao`; sucesso: `200` com `{ id, usuarioId, papel,
        ultimaAtividadeEm }`; erro: `401` com `type: "urn:cadastro-clientes:erro:nao-autenticado"`
- [ ] Montar o router de `sessao` em `backend/src/app.ts` sob o prefixo `/v1/sessoes`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/sessao/model.ts` | criar | tipos acima |
| `backend/src/sessao/repository.ts` | criar | `criarSessao`, `buscarSessaoPorId`, `tocarSessao` |
| `backend/src/sessao/service.ts` | criar | `login`, `validarSessao` |
| `backend/src/sessao/routes.ts` | criar | `POST /`, `GET /:id` |
| `backend/src/app.ts` | alterar | monta o router em `/v1/sessoes` |
| `backend/src/config/index.ts` | alterar | acrescenta `SESSION_IDLE_TIMEOUT_MS` (opcional, default 300000) — RN-004 não pode ser hardcoded, ver `docs/techspec/cadastro-clientes-techspec.md` §8 |
| `backend/jest.config.js` | criar | preset `ts-jest` — ausente desde a TASK-01.1, sem ele nenhum teste Jest do backend roda (nem os de EPIC-04/05, que já existem em `backend/test/`) |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/sessao.md` (contratos `POST
/v1/sessoes` e `GET /v1/sessoes/{id}`, literal) e `governance/guidelines/backend/node/architecture.md`
§5 (sessão por id opaco, hash `scrypt`, nunca JWT).

#### Guia técnico — pontos de atenção

- Nunca logar CPF nem senha, em nenhum nível (`governance/guidelines/backend/node/coding-standards.md`).
- O erro de `login` é **sempre** o mesmo texto para "CPF inexistente" e "senha errada" —
  qualquer diferença de mensagem ou de tempo de resposta perceptível quebra SCN-001.2.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /v1/sessoes` com CPF/senha do admin do seed devolve `201` com `id`, `usuarioId`, `papel: "admin_global"`, `criadoEm` | `curl` conforme `docs/techspec/cadastro-clientes/quickstart.md`, exemplo RF-001 |
| 2 | `POST /v1/sessoes` com senha errada e com CPF inexistente devolvem o **mesmo** corpo de erro `401` | dois `curl`s comparando o corpo |
| 3 | `GET /v1/sessoes/{id}` de uma sessão recém-criada devolve `200` | `curl` encadeado ao passo 1 |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; escopo do `DELETE` (logout) deliberadamente excluído — ver EPIC-05. |
| 2026-10-23 | concluída (tentativa 1 de 3) | Domínio `sessao` completo: `model.ts`, `repository.ts` (inclui `buscarUsuarioPorCpf` lendo a tabela `usuarios` direto, já que o domínio `usuario` próprio só nasce no EPIC-02 — revisar lá para não duplicar acesso à tabela), `service.ts`, `routes.ts`, router montado em `app.ts` sob `/v1/sessoes`. RN-004 implementada configurável via `SESSION_IDLE_TIMEOUT_MS` (`config/index.ts` alterado), não hardcoded em "5 minutos" como o texto da task sugeria — já esperado, decisão tomada depois da task ter sido escrita (ver `docs/techspec/cadastro-clientes-techspec.md` §8). Criado `backend/jest.config.js` (preset `ts-jest`) — faltava desde a TASK-01.1, sem ele nenhum teste Jest do backend roda. Critérios de aceite 1-3 confirmados manualmente via `curl` (login do admin do seed → 201; senha errada e CPF inexistente → mesmo corpo 401; `GET` da sessão recém-criada → 200). **Achado para EPIC-04/EPIC-05:** `backend/test/sessao/routes.test.ts` e `backend/test/cliente/routes.test.ts` (escritos em `/tests`) esperam `app.ts` exportar `criarApp(deps)` — uma factory com injeção de dependência (repository injetável) — que não existe em nenhum lugar da TechSpec/architecture.md (o padrão documentado é import direto routes→service→repository, sem DI). Isso é trabalho de quem implementar `DELETE /v1/sessoes/{id}` (TASK-05.x) e `DELETE /v1/clientes/{id}` com teste de concorrência (TASK-04.x) — registrado também em `memory/state.md` como pendência, não resolvido aqui por estar fora do escopo desta task (SCN-001.1/.2 apenas). `check_escopo.py --base HEAD` → exit 0. |
| 2026-10-23 | consolidação (TASK-02.1) | `buscarUsuarioPorCpf` movida para `usuario/repository.ts` (fonte canônica, agora que o domínio existe); `sessao/repository.ts` e `sessao/service.ts` passaram a importar de lá em vez de manter cópia própria — resolve a revisão já prevista aqui, sem duplicar acesso à tabela `usuarios`. Detalhe e commit em TASK-02.1. Achado de `criarApp(deps)` (acima) confirmado real: `npm test` agora falha em erro de compilação (`TS2305`, não mais "módulo ausente"), já que `backend/package.json` existe — ainda não resolvido, continua pendência para EPIC-04/05. |
| 2026-10-23 | resolvida (TASK-04.1) | `criarApp(deps)` implementado — não era um padrão ausente da documentação como registrado acima, estava em `governance/guidelines/backend/node/testing.md` §2-3 (`architecture.md` que não menciona). `middlewares/autenticacao.ts` ganhou `criarExigirSessao(validador)` para permitir `sessaoRepository` injetado. `cliente/routes.test.ts` (SCN-006.3) passa; `sessao/routes.test.ts` (SCN-009.3) continua 404 até o EPIC-05 implementar `DELETE /v1/sessoes/{id}`. Detalhe e commit em TASK-04.1. |
