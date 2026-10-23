### TASK-03.5 — BFF: proxy de clientes (incluir/listar) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.4, TASK-01.5
- **Cenários cobertos:** SCN-004.1, SCN-005.1, SCN-008.1, SCN-008.2
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5

#### Contexto

Repassa inclusão e listagem de cliente ao core, no mesmo padrão já usado para sessão e
usuário.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/clientes/route.ts`:
      - `POST` — lê o cookie `__Host-sessao`, chama o core com `X-Sessao-Id`, repassa `201`,
        `400` ou `409`
      - `GET` — mesma troca, repassa `200` com o array de clientes

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/clientes/route.ts` | criar | `POST` e `GET`, proxy para `/v1/clientes` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `frontend/src/app/api/usuarios/route.ts` (TASK-02.2).

#### Guia técnico — pontos de atenção

- Nenhuma checagem de papel aqui — RN-005 só exige sessão válida, qualquer papel passa.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /api/clientes` autenticado (qualquer papel) repassa `201` do core | `curl -i` |
| 2 | `GET /api/clientes` autenticado repassa `200` com o array | `curl -i` |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
