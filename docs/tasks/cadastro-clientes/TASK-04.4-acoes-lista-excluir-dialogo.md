### TASK-04.4 — Ações de editar/excluir na lista e diálogo de confirmação (T5) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-04.3, TASK-03.6
- **Cenários cobertos:** SCN-007.1, SCN-007.2, SCN-007.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T5); `docs/design/cadastro-clientes/prototypes/ListaClientes.html`

#### Contexto

Fecha RF-007 visualmente. T5 é um `AlertDialog` sobre a própria T3, não uma rota separada —
exatamente como já prototipado.

#### O que deve ser feito

- [ ] Alterar `frontend/src/app/(protected)/clientes/page.tsx` (criado na TASK-03.6):
      acrescentar coluna de ações por linha — link "Editar" (para `/clientes/[id]/editar`) e
      botão "Excluir"
- [ ] Botão "Excluir" abre um `AlertDialog` (componente de `frontend/src/components/ui/`,
      TASK-01.4): título "Excluir cliente [nome]?", `Button` secondary "Cancelar" e `Button`
      destructive "Excluir"
- [ ] Confirmar chama `DELETE /api/clientes/[id]`; sucesso (`204`): remove o cliente da lista
      (sem precisar recarregar a página) e mostra toast de sucesso
- [ ] Nenhum tratamento especial para "cliente já excluído por outra sessão" é necessário no
      frontend — o `DELETE` já responde `204` nesse caso também (TASK-04.1), e a lista
      simplesmente deixa de mostrar o cliente

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/page.tsx` | alterar | acrescenta coluna de ações e o diálogo de confirmação |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/ListaClientes.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/ListaClientes.html` (diálogo de
exclusão já prototipado como overlay da lista).

#### Guia técnico — pontos de atenção

- Exclusão é **definitiva** (RN-009) — nenhuma ação de "desfazer" ou reativação em nenhuma
  tela, mesmo que pareça uma melhoria de UX óbvia.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Excluir um cliente pela lista, confirmando o diálogo, remove-o da lista | navegação manual |
| 2 | Cancelar o diálogo não exclui nada | navegação manual |
| 3 | Depois de excluído, o cliente não aparece em nenhuma lista nem tem forma de reativação na interface | navegação manual, conferindo a lista e a ausência de botão de reativar |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
