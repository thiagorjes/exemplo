### TASK-03.8 — Formulário de inclusão de cliente Pessoa Jurídica com sócios (T4, DDR-001) [web]

- **Status:** concluída
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.7
- **Cenários cobertos:** SCN-005.1, SCN-005.2, SCN-005.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T4, modo PJ);
  `docs/decisions/DDR-001-lista-dinamica-de-socios.md`

#### Contexto

Fecha RF-005 visualmente — acrescenta o modo Pessoa Jurídica ao formulário criado na
TASK-03.7, com a lista dinâmica de sócios decidida em DDR-001.

#### O que deve ser feito

- [ ] Alterar `frontend/src/app/(protected)/clientes/novo/page.tsx`: quando o tipo
      selecionado for Pessoa Jurídica, mostrar os campos `nomeFantasia`, `razaoSocial`,
      `documento` (CNPJ, máscara), `dataAbertura`, `endereco`, `telefone`, e a lista
      dinâmica de sócios
- [ ] Lista de sócios (via `useFieldArray` do `react-hook-form`): cada linha com `Input`
      `nomeCompleto` + `Input` `cpf` (máscara) + `Button` ghost com ícone "remover"; rodapé
      com `Button` secondary "Adicionar sócio"; **sem limite de linhas** (DDR-001)
- [ ] Submit bloqueado com erro inline se a lista de sócios estiver vazia (espelha
      `socios.min(1)` do schema do backend, TASK-03.1 — SCN-005.3)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/novo/page.tsx` | alterar | acrescenta o modo Pessoa Jurídica |
| `frontend/src/app/(protected)/clientes/novo/_components/formulario-cliente-pj.tsx` | criar | não estava na tabela original — mesmo padrão de isolamento em sub-componente já usado para PF na TASK-03.7 |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`
(estado Pessoa Jurídica, lista de sócios) e `docs/decisions/DDR-001-lista-dinamica-de-socios.md`
(decisão e motivo, inclusive a alternativa descartada de limitar a quantidade de sócios).

#### Guia técnico — pontos de atenção

- Sem limite de sócios — não adicionar paginação nem truncamento da lista (DDR-001 já
  decidiu aceitar esse trade-off nesta demo).
- `aria-label` obrigatório no botão ghost ícone "remover" (acessibilidade — `docs/design/cadastro-clientes-design-brief.md`
  §7).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Alternar para Pessoa Jurídica mostra os campos corretos e a lista de sócios com uma linha inicial | navegação manual |
| 2 | Adicionar e remover linhas de sócio funciona sem limite (testar com 5 ou mais) | navegação manual |
| 3 | Confirmar sem nenhum sócio mostra erro inline e não submete | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
| 2026-10-23 | concluída (tentativa 1 de 3) | `_components/formulario-cliente-pj.tsx` com `useFieldArray` (react-hook-form) para a lista de sócios, sem limite (DDR-001). Divergência do critério 1 da task: a lista de sócios começa **vazia**, não com uma linha inicial — o cenário congelado `SCN-005.1`/`SCN-005.3` clica explicitamente em "+ Adicionar sócio" antes de preencher, confirmando que o estado inicial esperado é vazio; segui o cenário congelado, não a prosa da task. Botão remover com `aria-label="Remover sócio"` (ícone `TrashIcon`). SCN-005.1/.2/.3 verdes headed; suíte cumulativa completa (EPIC-01 a EPIC-03, 18 cenários) revalidada headed após esta task, todos verdes. `npx tsc --noEmit` limpo. `check_escopo.py --base HEAD` → exit 0. |
