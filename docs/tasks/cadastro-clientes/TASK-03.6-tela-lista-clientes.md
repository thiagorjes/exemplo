### TASK-03.6 — Tela de Lista de clientes (T3) [web]

- **Status:** concluída
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.5
- **Cenários cobertos:** SCN-008.1, SCN-008.2, SCN-008.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T3); `docs/design/cadastro-clientes/prototypes/ListaClientes.html`

#### Contexto

Fecha RF-008 visualmente e é o ponto de entrada para incluir, editar e excluir cliente.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/clientes/page.tsx`: `Table` do design system
      listando `GET /api/clientes` — colunas tipo, documento, nome (nome completo se PF,
      razão social se PJ), telefone; botão "Incluir cliente" (link para `/clientes/novo`);
      estado `loading` (skeleton), estado vazio ("Nenhum cliente cadastrado."), estado de
      erro ao carregar a lista

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/page.tsx` | criar | listagem + botão incluir |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/ListaClientes.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/ListaClientes.html` (estados
idle/loading/erro/vazio já prototipados).

#### Guia técnico — pontos de atenção

- As ações de **editar** e **excluir** por linha **não** entram nesta task — são
  acrescentadas a este mesmo arquivo pelo EPIC-04 (TASK-04.5 e TASK-04.6), que altera este
  componente em vez de recriá-lo.
- O redirecionamento para `/login` sem sessão já é herdado do `(protected)/layout.tsx`
  (TASK-01.5) — não reimplementar aqui.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | A lista exibe todos os clientes cadastrados | navegação manual |
| 2 | Com nenhum cliente cadastrado, aparece a mensagem de lista vazia | ambiente recém-migrado |
| 3 | Acessar `/clientes` sem sessão redireciona para `/login` | navegação manual sem cookie |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; ações de editar/excluir deliberadamente fora — ver EPIC-04. |
| 2026-10-23 | concluída (tentativa 1 de 3) | `page.tsx` com tabela, estados loading/vazio/erro e botão "Incluir cliente" (link para `/clientes/novo`, ainda não existe — chega na TASK-03.7). Texto do estado vazio ajustado para "Nenhum cliente cadastrado ainda." (a task sugeria "Nenhum cliente cadastrado." — o cenário congelado `SCN-008.2` exige o texto com "ainda"). SCN-008.1/.2/.3 verdes headed, banco resetado antes. `npx tsc --noEmit` limpo. `check_escopo.py --base HEAD` → exit 0. |
