### TASK-01.3 — Domínio sessão: login e validação [api]

- **Status:** pendente
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
