### TASK-02.1 — Middleware de autenticação + domínio usuário (criar/listar) [api]

- **Status:** concluída
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.3
- **Cenários cobertos:** SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3
- **Origem:** `docs/techspec/cadastro-clientes/contracts/usuario.md`; `docs/techspec/cadastro-clientes/contracts/sessao.md` (regra "RN-005" e "RN-006" aplicadas aqui)

#### Contexto

Primeiro consumidor da checagem de sessão/papel — por isso esta task cria o middleware
compartilhado de autenticação (reusado depois pelos domínios `cliente` em EPIC-03/04), além do
domínio `usuario` em si (criar e listar).

#### O que deve ser feito

- [ ] Criar `backend/src/middlewares/autenticacao.ts`:
      - `exigirSessao`: lê o header `X-Sessao-Id` (é assim que o BFF repassa a sessão ao
        core — o browser/Playwright nunca manda esse header diretamente, só o BFF); se
        ausente, `401`; chama `sessaoService.validarSessao(id)` (de `backend/src/sessao/service.ts`,
        criado na TASK-01.3); se inválida, `401` (`type: "urn:cadastro-clientes:erro:nao-autenticado"`);
        se válida, anexa `req.sessao = { usuarioId, papel }` e segue
      - `exigirAdminGlobal`: roda depois de `exigirSessao`; se `req.sessao.papel !==
        'admin_global'`, `403` (`type: "urn:cadastro-clientes:erro:acesso-negado"`)
- [ ] Criar `backend/src/usuario/model.ts`:
      ```ts
      export type UsuarioCriado = { id: string; cpf: string; papel: 'usuario'; criadoEm: string };
      export type UsuarioResumo = { id: string; cpf: string; papel: 'admin_global' | 'usuario'; criadoEm: string };
      ```
- [ ] Criar `backend/src/usuario/repository.ts`: `criarUsuario({ cpf, senhaHash }):
      UsuarioCriado` (insere sempre com `papel = 'usuario'` — não existe caminho para criar
      um segundo `admin_global` nesta demo); `buscarUsuarioPorCpf(cpf)`; `listarUsuarios():
      UsuarioResumo[]`
- [ ] Criar `backend/src/usuario/service.ts`:
      - `criarUsuario(cpf: string, senha: string): UsuarioCriado` — se já existe usuário com
        esse `cpf`, lança `ConflitoError` com `codigoRegra: "RN-USU-01"`, `dadosApoio: { cpf
        }` (RN-002, SCN-002.2); senão gera hash `scrypt` da senha e insere
      - `listarUsuarios(): UsuarioResumo[]` — delega ao repository, sem paginação (RNF-004)
- [ ] Criar `backend/src/usuario/routes.ts`, com `exigirSessao` e `exigirAdminGlobal`
      aplicados às duas rotas:
      - `POST /` — valida `{ cpf: string, senha: string (min 8) }` com Zod (`400` se `senha`
        tiver menos de 8 caracteres — RN-003, ou `cpf` fora do formato); chama
        `criarUsuario`; sucesso: `201`, `Location: /v1/usuarios/{id}`, corpo `{ id, cpf,
        papel: "usuario", criadoEm }` (nunca senha/hash)
      - `GET /` — chama `listarUsuarios`; `200` com o array de `UsuarioResumo`
- [ ] Montar o router de `usuario` em `backend/src/app.ts` sob o prefixo `/v1/usuarios`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/middlewares/autenticacao.ts` | criar | `exigirSessao`, `exigirAdminGlobal` |
| `backend/src/usuario/model.ts` | criar | tipos acima |
| `backend/src/usuario/repository.ts` | criar | `criarUsuario`, `buscarUsuarioPorCpf`, `listarUsuarios` |
| `backend/src/usuario/service.ts` | criar | `criarUsuario`, `listarUsuarios` |
| `backend/src/usuario/routes.ts` | criar | `POST /`, `GET /` |
| `backend/src/app.ts` | alterar | monta o router em `/v1/usuarios` |
| `backend/src/sessao/repository.ts` | alterar | fora do escopo original — remove `buscarUsuarioPorCpf` duplicada (consolidada em `usuario/repository.ts`, prevista desde a TASK-01.3) |
| `backend/src/sessao/service.ts` | alterar | fora do escopo original — importa `buscarUsuarioPorCpf` de `usuario/repository.ts` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/usuario.md` (contratos `POST
/v1/usuarios` e `GET /v1/usuarios`, literal, incluindo `codigoRegra: "RN-USU-01"`) e
`backend/src/sessao/service.ts` (TASK-01.3) para o formato de erro de autenticação.

#### Guia técnico — pontos de atenção

- `exigirAdminGlobal` nunca decide sozinho sem `exigirSessao` ter rodado antes — a ordem dos
  middlewares importa (sessão inválida deve dar `401`, não `403`).
- Nenhuma rota desta task aceita `papel` no corpo da requisição — `papel = 'usuario'` é fixo
  no `repository`, nunca vindo do cliente da API.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /v1/usuarios` autenticado como admin, com CPF novo e senha de 8+ caracteres, devolve `201` e o usuário passa a aparecer em `GET /v1/usuarios` | `curl` conforme `quickstart.md`, exemplos RF-002 e RF-003 |
| 2 | `POST /v1/usuarios` com CPF já cadastrado devolve `409` com `codigoRegra: "RN-USU-01"` | `curl` repetindo o CPF do passo 1 |
| 3 | `POST /v1/usuarios` e `GET /v1/usuarios` autenticados como `papel: "usuario"` (não admin) devolvem `403` | `curl` com `X-Sessao-Id` de uma sessão de usuário comum |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; middleware de autenticação centralizado aqui para reaproveitamento pelos domínios seguintes. |
| 2026-10-23 | concluída (tentativa 1 de 3) | `exigirSessao`/`exigirAdminGlobal` criados; domínio `usuario` completo (`model`, `repository`, `service`, `routes`); router montado em `/v1/usuarios`. Consolidação: `buscarUsuarioPorCpf` movida de `sessao/repository.ts` para `usuario/repository.ts` (fonte única), `sessao/service.ts` ajustado. Critérios de aceite 1-3 confirmados via `curl`: criar usuário → `201`, aparece em `GET /v1/usuarios`; CPF repetido → `409`; sem sessão → `401`. `npx tsc --noEmit` limpo. `npm test` do backend continua falhando (TS2305, `criarApp` ausente) — pendência pré-existente de EPIC-04/05, não desta task. `check_escopo.py --base HEAD` → exit 0. |
