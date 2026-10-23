### TASK-01.4 — Scaffolding do frontend Next.js [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** nenhuma
- **Cenários cobertos:** SCN-001.1
- **Origem:** `governance/guidelines/frontend/nextjs/design-system.md`, `frontend/_shared/design-system-common.md`, `frontend/_shared/design-tokens.json`

#### Contexto

Estrutura mínima do BFF/SPA, reaproveitando integralmente o design system Banestes já
elaborado — nenhuma decisão de marca, cor ou tipografia é tomada aqui, só materialização.

#### O que deve ser feito

- [ ] Criar `frontend/package.json` com as versões de `governance/guidelines/frontend/nextjs/stack.md`:
      Next.js 16, React 19, TypeScript, Tailwind CSS 3.4.17, `class-variance-authority`,
      `clsx`, `tailwind-merge`, `tailwindcss-animate`, `@phosphor-icons/react`, primitivos
      `@radix-ui/react-*` necessários a `Button`, `Input`, `Table`, `AlertDialog`
- [ ] Criar `frontend/src/lib/utils.ts` com a função `cn()` (`clsx` + `tailwind-merge`),
      conforme `governance/guidelines/frontend/nextjs/design-system.md` ("Mecânica de
      composição")
- [ ] Criar os primitivos mínimos em `frontend/src/components/ui/`: `button.tsx`,
      `input.tsx`, `table.tsx`, `alert-dialog.tsx` — API conforme
      `governance/guidelines/frontend/_shared/design-system-common.md` (headless + CVA +
      `cn()`); se `governance/guidelines/frontend/nextjs/components/` já tiver o código-fonte
      pronto, copiar literalmente de lá em vez de reescrever
- [ ] Criar `frontend/tailwind.config.ts` e `frontend/src/app/globals.css` com os tokens de
      `governance/guidelines/frontend/_shared/design-tokens.json`: cores semânticas `light`
      (`background #ffffff`, `foreground #374151`, `primary #004b8d`, `primary-hover
      #003564`, `destructive-foreground #991b1b`, etc. — copiar a tabela `color.semantic.light`
      inteira) e `dark`; `--space-base: 1rem`; `--radius: 1rem`
- [ ] Criar `frontend/src/app/layout.tsx` mínimo, fonte Inter (`next/font/local` se o arquivo
      da fonte estiver disponível no ambiente; `next/font/google` como alternativa documentada
      em comentário se não estiver)
- [ ] Criar `frontend/.env.example` documentando `API_GATEWAY_URL` e `SESSION_COOKIE_SECRET`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/package.json` | criar | dependências e versões acima |
| `frontend/tailwind.config.ts` | criar | cores/espaçamento/radius dos tokens |
| `frontend/src/app/globals.css` | criar | CSS custom properties `:root`/`.dark` |
| `frontend/src/app/layout.tsx` | criar | fonte Inter |
| `frontend/src/lib/utils.ts` | criar | `cn()` |
| `frontend/src/components/ui/button.tsx` | criar | primitivo do design system |
| `frontend/src/components/ui/input.tsx` | criar | primitivo do design system |
| `frontend/src/components/ui/table.tsx` | criar | primitivo do design system |
| `frontend/src/components/ui/alert-dialog.tsx` | criar | primitivo do design system |
| `frontend/.env.example` | criar | `API_GATEWAY_URL`, `SESSION_COOKIE_SECRET` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`,
`docs/design/cadastro-clientes/prototypes/*.html` (são referência visual, não código de
produção), `frontend/test/` ou `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `governance/guidelines/frontend/nextjs/design-system.md` e
`frontend/_shared/design-system-common.md` (tokens, mecânica `cn()`/CVA);
`governance/guidelines/frontend/_shared/design-tokens.json` (valores exatos);
`docs/design/cadastro-clientes/prototypes/Login.html` como referência do resultado visual
esperado (não copiar HTML estático — é protótipo, não componente React).

#### Guia técnico — pontos de atenção

- Nenhum valor de cor/espaçamento/raio é aproximado — todos vêm literalmente de
  `governance/guidelines/frontend/_shared/design-tokens.json`.
- `'use client'` só nos primitivos interativos (`Button`, `Input`, `AlertDialog`); `Table`
  pode ser apresentacional se não tiver estado próprio.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `cd frontend && npm install && npm run dev` sobe em `localhost:3000` sem erro | execução manual |
| 2 | Uma página de teste renderiza o `Button` do design system com `background-color: #004b8d` computado | inspeção no DevTools do browser |
| 3 | `npm run build` compila sem erro de tipo | execução manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`, a partir da coleção `frontend/nextjs` elaborada. |
