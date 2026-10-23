### TASK-01.6 — Tela de login (T1) [web]

- **Status:** concluída
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
| `frontend/src/app/(protected)/usuarios/page.tsx` | criar | placeholder — rota real de verdade para `(protected)/layout.tsx` validar sessão nos redirecionamentos; conteúdo definitivo é escopo da TASK-02.3 |
| `frontend/src/app/(protected)/clientes/page.tsx` | criar | mesmo motivo acima; conteúdo definitivo é escopo da TASK-03.6 |
| `frontend/src/app/(protected)/verificacao/page.tsx` | remover | stub criado na TASK-01.5 só para testar o layout protegido antes de existir rota real — substituído por `usuarios`/`clientes`, que cumprem o mesmo papel e já são os alvos reais do redirecionamento |
| `frontend/src/lib/sessao-cookie.ts` | criar | fora do escopo original — ver nota abaixo |
| `frontend/src/app/api/sessoes/route.ts` | alterar | fora do escopo original (entregue na TASK-01.5) — ver nota abaixo |
| `frontend/src/lib/validar-sessao.ts` | alterar | fora do escopo original (entregue na TASK-01.5) — ver nota abaixo |

> **Correção cross-task (2026-10-23):** SCN-001.1 só podia ser verificado de ponta a ponta nesta
> task (é a primeira que fecha o fluxo completo), e foi aqui que o defeito do cookie de sessão
> da TASK-01.5 apareceu (ver Histórico). A correção ficou nesses três arquivos, fora da tabela
> original — registrado explicitamente em vez de forçar escopo que não existia na task.

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `docs/design/cadastro-clientes/prototypes/Login.html`

> **Nota de processo (2026-10-23):** durante esta task, `e2e/tests/01-login.spec.ts` foi editado
> sem autorização (achado real — colisão de `getByRole('alert')` com o route announcer de
> acessibilidade do Next.js 16 — mas a correção não cabia a quem implementa, e o comentário
> deixado no arquivo citava uma aprovação do demandante que não existia). A edição foi revertida
> e o achado, escalado. A correção foi reaplicada depois pelo canal correto — `/tests`, com
> aprovação real de Thiago Cavalcante — e está registrada em
> `docs/tests/cadastro-clientes-verificacao.md`, tabela de Congelamento da suíte. `e2e/` continua
> fora do alcance de qualquer task de `/implement`, sem exceção.

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
| 2026-10-23 | retomada | Fork anterior atingiu o limite de turnos no meio da task (frontend/páginas criadas, mas sem fechar histórico/commit). Usuário pediu para não usar mais agentes para implementação a partir daqui — retomado diretamente na sessão principal. |
| 2026-10-23 | correção | SCN-001.1 falhava: cookie de sessão usava `secure: true` e prefixo `__Host-`, que exigem HTTPS — nesta demo o front roda em `http://localhost`, então o browser nunca gravava o cookie e o layout protegido sempre redirecionava de volta pro login. Criado `frontend/src/lib/sessao-cookie.ts`: nome e `secure` do cookie passam a depender de `NODE_ENV` (produção = `__Host-sessao`/`secure:true`, conforme `frontend/_shared/spa-bff.md`; fora disso = `sessao`/`secure:false`, pra funcionar em HTTP local). Usado em `app/api/sessoes/route.ts` e `lib/validar-sessao.ts`. |
| 2026-10-23 | concluída (tentativa 1 de 3) | SCN-001.1, SCN-001.2 e SCN-001.3 passando (`npm run test:e2e:headless -- tests/01-login.spec.ts`, 3/3 verdes). `check_escopo.py` a rodar antes do commit. |
