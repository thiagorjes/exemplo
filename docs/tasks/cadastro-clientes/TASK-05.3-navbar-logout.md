### TASK-05.3 — Navbar autenticada com ação de logout [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-05.2, TASK-02.3, TASK-03.6
- **Cenários cobertos:** SCN-009.1, SCN-009.2, SCN-009.3
- **Origem:** `governance/guidelines/frontend/_shared/design-system-common.md` ("Navbar fixa");
  `docs/techspec/cadastro-clientes-techspec.md` §10, Q-001

#### Contexto

Fecha RF-009 visualmente e resolve a pendência Q-001 da TechSpec: os protótipos de T1–T5
foram feitos antes de RF-009 existir, então não têm o elemento de logout desenhado — esta
task o acrescenta diretamente na implementação, sem reabrir `/design`.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/_components/navbar.tsx`: navbar fixa (altura 80px,
      `border-b`, `z-50`, conforme `governance/guidelines/frontend/_shared/design-system-common.md`)
      com o papel da pessoa autenticada e um botão "Sair" com texto visível (não ícone-only,
      para não exigir `aria-label` extra); ao clicar, chama `DELETE /api/sessoes` e
      redireciona para `/login`
- [ ] Alterar `frontend/src/app/(protected)/layout.tsx` (TASK-01.5): renderizar a `Navbar`
      acima do conteúdo em todas as telas protegidas (`/usuarios`, `/clientes`,
      `/clientes/novo`, `/clientes/[id]/editar`)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/_components/navbar.tsx` | criar | navbar com ação de logout |
| `frontend/src/app/(protected)/layout.tsx` | alterar | renderiza a `Navbar` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/*.html` (referência visual — nenhum protótipo é
alterado; a pendência Q-001 é resolvida na implementação, não retroativamente no protótipo).

#### Guia técnico — padrão a seguir

Referência viva: `governance/guidelines/frontend/_shared/design-system-common.md` ("Navbar
fixa | altura 80 (`h-[5rem]`), `border-b`, `z-50`").

#### Guia técnico — pontos de atenção

- Texto do botão é "Sair", não ícone — simplifica acessibilidade e evita inventar iconografia
  não prevista no design brief.
- Clique duplo rápido no "Sair" não pode gerar erro visível — o backend (TASK-05.1) já é
  idempotente; o frontend só precisa desabilitar o botão após o primeiro clique, como em
  qualquer submit.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Clicar em "Sair" em qualquer tela protegida encerra a sessão e redireciona para `/login` | navegação manual, nas três telas protegidas |
| 2 | Depois do logout, voltar pelo histórico do browser e tentar acessar uma rota protegida redireciona de novo para `/login` | navegação manual |
| 3 | Clicar em "Sair" duas vezes em sequência rápida não produz erro visível na tela | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; resolve a pendência Q-001 da TechSpec. |
