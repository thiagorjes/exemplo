### TASK-04.2 — BFF: proxy de cliente por id [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-04.1, TASK-01.5
- **Cenários cobertos:** SCN-006.1, SCN-006.2, SCN-007.1, SCN-007.2
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5

#### Contexto

Repassa obter, editar e excluir um cliente específico ao core.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/clientes/[id]/route.ts`:
      - `GET` — repassa `200`, `404` ou `410` do core
      - `PUT` — repassa `200` ou `400`
      - `DELETE` — repassa `204` (mesmo se chamado duas vezes) ou `404`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/clientes/[id]/route.ts` | criar | `GET`, `PUT`, `DELETE`, proxy para `/v1/clientes/{id}` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `frontend/src/app/api/clientes/route.ts` (TASK-03.5).

#### Guia técnico — pontos de atenção

- Repassar o status `410` do core sem traduzi-lo para `404` — a tela de edição (TASK-04.3)
  precisa da distinção para mostrar a mensagem certa.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `GET /api/clientes/[id]` repassa `200`/`404`/`410` do core sem alterar o status | `curl -i`, três casos |
| 2 | `PUT /api/clientes/[id]` repassa `200`/`400` do core | `curl -i` |
| 3 | `DELETE /api/clientes/[id]` repassa `204` do core nas duas chamadas seguidas | dois `curl -i` |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
