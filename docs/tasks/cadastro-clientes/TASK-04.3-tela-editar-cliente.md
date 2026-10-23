### TASK-04.3 — Tela de edição de cliente (T4, modo editar) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-04.2, TASK-03.8
- **Cenários cobertos:** SCN-006.1, SCN-006.2
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T4, modo editar); `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`

#### Contexto

Reaproveita o formulário de inclusão criado nas TASK-03.7/03.8, extraído para um componente
compartilhado, agora pré-preenchido com os dados do cliente.

#### O que deve ser feito

- [ ] Extrair o formulário de cliente (campos PF/PJ + lista dinâmica de sócios, hoje dentro
      de `frontend/src/app/(protected)/clientes/novo/page.tsx`) para
      `frontend/src/app/(protected)/clientes/_components/cliente-form.tsx`, recebendo
      `valoresIniciais?: Cliente` e `aoSubmeter: (dados) => Promise<void>` como props
- [ ] Alterar `frontend/src/app/(protected)/clientes/novo/page.tsx` para usar o componente
      extraído, passando `aoSubmeter` que chama `POST /api/clientes` (comportamento
      inalterado)
- [ ] Criar `frontend/src/app/(protected)/clientes/[id]/editar/page.tsx`: carrega o cliente
      via `GET /api/clientes/[id]`; se `410`, mostra "Este cliente foi excluído e não pode
      mais ser editado." com um link de volta para `/clientes` (sem formulário); se `404`,
      mensagem de não encontrado; se `200`, renderiza `ClienteForm` com `valoresIniciais` e
      `tipo` bloqueado (campo desabilitado — PUT não permite trocar `tipo`), `aoSubmeter`
      chamando `PUT /api/clientes/[id]`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/_components/cliente-form.tsx` | criar | formulário compartilhado (extraído) |
| `frontend/src/app/(protected)/clientes/novo/page.tsx` | alterar | passa a usar o componente extraído |
| `frontend/src/app/(protected)/clientes/[id]/editar/page.tsx` | criar | carrega, trata 404/410, usa o formulário compartilhado |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (o
mesmo protótipo cobre os dois modos, incluir e editar).

#### Guia técnico — pontos de atenção

- O campo `tipo` fica **desabilitado** (somente leitura) no modo editar — nunca enviado como
  editável no corpo do `PUT`.
- A extração do formulário não pode mudar o comportamento já validado em TASK-03.7/03.8 —
  é refatoração de local do código, não de regra.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Editar um cliente existente altera o cadastro e os dados novos aparecem na lista | navegação manual |
| 2 | Deixar um campo obrigatório vazio na edição mostra erro inline, sem submeter | navegação manual |
| 3 | Acessar a edição de um cliente já excluído mostra a mensagem apropriada, não o formulário | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
