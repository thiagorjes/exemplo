### TASK-01.6 — Tela de login (T1) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.5
- **Cenários cobertos:** SCN-001.1, SCN-001.2, SCN-001.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (telas T1, §2-3, §6-7); `docs/design/cadastro-clientes/prototypes/Login.html`

#### Contexto

Fecha o primeiro cenário e2e inteiramente verificável visualmente — é a primeira tela que a
suíte Playwright headed vai abrir.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(public)/login/page.tsx`: formulário com campos CPF (máscara
      via `react-imask`, conforme `governance/guidelines/frontend/nextjs/design-system.md`,
      "Bibliotecas por primitivo") e senha (`type="password"`), usando os componentes `Input`
      e `Button` de `frontend/src/components/ui/`
- [ ] No submit, chama `POST /api/sessoes`; em sucesso, lê `{ papel }` da resposta e
      redireciona: `papel === 'admin_global'` → `/usuarios`; `papel === 'usuario'` → `/clientes`
- [ ] Em erro `401`, exibe a mensagem única "CPF ou senha inválidos" (sem indicar qual campo
      está errado — SCN-001.2) abaixo do formulário
- [ ] Botão de submit entra em estado `loading` (desabilitado + indicador visual) enquanto
      aguarda a resposta, conforme `docs/design/cadastro-clientes-design-brief.md` §6

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(public)/login/page.tsx` | criar | formulário de login |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/Login.html` (referência visual, não alterar).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/Login.html` (resultado visual
esperado — abrir no browser antes de codificar) e `docs/design/cadastro-clientes-design-brief.md`
§2 (cores: `--color-primary #004b8d` no botão de submit), §7 (labels via `htmlFor`/`id`).

#### Guia técnico — pontos de atenção

- A mensagem de erro é **literal e única**: "CPF ou senha inválidos" — não reaproveitar texto
  de validação de formato de campo, que é um erro diferente (não testado aqui).
- SCN-001.3 (expiração em 5 min) não exige nenhuma tela nova — é a mesma tela de login
  reaparecendo depois do redirecionamento por `401` do `(protected)/layout.tsx` (TASK-01.5).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Login com CPF/senha do admin do seed redireciona para `/usuarios` | navegação manual, depois confirmado em `/tests` |
| 2 | Login com senha errada mostra "CPF ou senha inválidos" e permanece em `/login` | navegação manual |
| 3 | Formulário é operável só por teclado (Tab entre campos, Enter submete) | teste manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
