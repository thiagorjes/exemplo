# Screen Map: cadastro-clientes

**Gerado em:** 2026-10-22
**Design Brief:** docs/design/cadastro-clientes-design-brief.md
**Shape Brief:** docs/shape/cadastro-clientes-brief.md
**Exploração de Solução:** docs/solution/cadastro-clientes-solution.md

> Nota de adaptação: o pipeline deste sistema roda `/solution → /design → /prd`,
> então o PRD ainda não existe nesta etapa. A tabela abaixo usa os fluxos de
> `/solution` no lugar dos RFs — quando o `/prd` numerar os RFs, cada um deve
> mapear para uma das telas já cobertas aqui.

## Cobertura de fluxos

| Fluxo (`docs/solution/cadastro-clientes-solution.md`) | Tela(s) | Status |
| --- | --- | --- |
| Admin global cria usuário | T2 | coberto |
| Login | T1 | coberto |
| Incluir cliente (PF ou PJ) | T4 | coberto |
| Editar cadastro de cliente | T4 (modo editar) | coberto |
| Excluir cadastro de cliente | T5 (diálogo embutido em T3) | coberto |
| (implícito) listar/buscar clientes já cadastrados | T3 | coberto — ponto de entrada para incluir/editar/excluir |

## Inventário de telas

| ID | Nome | Rota | Arquivo do protótipo | Estados cobertos no protótipo |
| --- | --- | --- | --- | --- |
| T1 | Login | `/login` | `prototypes/Login.html` | idle, loading, erro |
| T2 | Gestão de usuários | `/usuarios` | `prototypes/GestaoUsuarios.html` | idle, loading, preenchido, erro, sucesso, vazio |
| T3 | Lista de clientes | `/clientes` | `prototypes/ListaClientes.html` | idle, loading, erro, vazio |
| T4 | Incluir/editar cliente | `/clientes/novo`, `/clientes/:id/editar` | `prototypes/IncluirEditarCliente.html` | idle, preenchido, erro, sucesso, vazio (sócios) |
| T5 | Confirmar exclusão | modal sobre `/clientes` | embutido em `prototypes/ListaClientes.html` (overlay) | idle (confirmação), erro (já excluído por outra sessão) |

## Fluxos

**Happy path — Admin global:** T1 (login) → T2 (criar usuário, CPF + senha) → toast de sucesso → tabela de usuários atualizada em T2.

**Happy path — Usuário:** T1 (login) → T3 (lista de clientes) → botão "Novo cliente" → T4 (preenche PF ou PJ) → toast de sucesso → volta para T3.

**Erro — Login:** T1 com credencial inválida → alerta genérico, sem indicar qual campo está errado (consistente com `docs/solution/cadastro-clientes-solution.md`, Fluxo Login).

**Erro — Exclusão concorrente:** T3 → abrir diálogo de exclusão (T5) → tweak "já excluído por outra sessão" → alerta substitui a pergunta de confirmação, sem ação de excluir disponível (consistente com Regra de borda #4 da Exploração de Solução).

## Gaps identificados

- Nenhum gap de cobertura entre `/solution` e o inventário de telas.
- Em aberto (não é gap de design, é decisão pendente para `/prd`, já registrada no Design Brief, seção "Decisões em aberto"): layout de lista de sócios em linhas vs. cartões — o protótipo usa linhas (Opção A).
- `T5` foi prototipada como overlay dentro de `ListaClientes.html` em vez de arquivo HTML isolado, por ser um diálogo que só existe no contexto de T3 — decisão de prototipagem, não altera o inventário de telas do Design Brief.
