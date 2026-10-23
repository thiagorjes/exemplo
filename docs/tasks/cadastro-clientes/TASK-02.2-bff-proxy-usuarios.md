### TASK-02.2 — BFF: proxy de usuários [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-02.1, TASK-01.5
- **Cenários cobertos:** SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5

#### Contexto

Repassa as chamadas de criação e listagem de usuário ao core, convertendo o cookie de sessão
do browser no header `X-Sessao-Id` que o core espera.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/usuarios/route.ts`:
      - `POST` — lê o cookie `__Host-sessao`, chama `fetch(`${API_GATEWAY_URL}/v1/usuarios`,
        { method: 'POST', headers: { 'X-Sessao-Id': <id-do-cookie> }, body: ... })`; repassa
        o status e o corpo da resposta do core ao browser (`201`, `400`, `403` ou `409`)
      - `GET` — mesma troca de cookie por header, repassa `200` com o array de usuários, ou
        `403`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/usuarios/route.ts` | criar | `POST` e `GET`, proxy para `/v1/usuarios` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `frontend/src/app/api/sessoes/route.ts` (TASK-01.5) — mesmo padrão de leitura
de cookie e troca por header ao chamar o core.

#### Guia técnico — pontos de atenção

- O corpo de erro do core (Problem Details) é repassado como veio — o BFF não reescreve
  `codigoRegra` nem `dadosApoio`.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /api/usuarios` autenticado como admin repassa `201` do core | `curl -i` com cookie de sessão de admin |
| 2 | `GET /api/usuarios` autenticado como `usuario` repassa `403` do core | `curl -i` com cookie de sessão de usuário comum |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
