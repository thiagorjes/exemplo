# Stack — Frontend Next.js

> Extraída de `systems/transacional-ibanking-web` (Internet Banking transacional).
> Design system (tokens, componentes, mecânica visual): [`design-system.md`](design-system.md)
> + [`design-tokens.json`](../_shared/design-tokens.json) + [`components/`](components/). Método de design
> agnóstico: [`../_shared/design-principles.md`](../_shared/design-principles.md).

## Runtime e linguagem

| Item | Versão | Observação |
|---|---|---|
| Node.js | 24.x | `.nvmrc` = `24`, `engines` e imagem base e de build na mesma versão principal; `preinstall` falha se não for 24.x |
| TypeScript | 6.x | `strict: true` + `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`, `useUnknownInCatchVariables` |
| React | 19.x | Server Components habilitados (`rsc: true`) |
| Next.js | 16.x | App Router; Turbopack; `poweredByHeader: false`; sem source maps em produção |

Path alias único: `@/* → ./src/*`.

## Framework e UI

| Biblioteca | Uso |
|---|---|
| `next` (App Router) | Rotas, route handlers (BFF), layouts, RSC |
| `react` / `react-dom` 19 | UI |
| Tailwind CSS 3.4 + `tailwindcss-animate` | Estilização utilitária; `class-variance-authority`, `clsx`, `tailwind-merge` |
| Radix UI (`@radix-ui/react-*`) | Primitivos acessíveis |
| shadcn/ui (`components.json`, style `new-york`, baseColor `zinc`) | Componentes em `src/components/ui` |
| `@phosphor-icons/react`, `@radix-ui/react-icons` | Ícones |
| `lottie-react`, `sonner`, `vaul`, `cmdk`, `input-otp`, `react-day-picker` | Componentes especializados |

## Estado e dados

| Biblioteca | Uso |
|---|---|
| `@reduxjs/toolkit` + `react-redux` + `redux-persist` | Estado global do cliente (sessão, seleção de conta) |
| `@tanstack/react-query` (+ devtools) | Estado de servidor: fetch, cache, mutations |
| `@tanstack/react-table` | Tabelas de dados (extratos, transações) |
| `axios` | Cliente HTTP dos route handlers para o `API_GATEWAY_URL` |
| `react-hook-form` + `@hookform/resolvers` + `zod` 4 | Formulários e validação de schema |
| `dayjs` | Datas |

## Segurança (libs)

| Biblioteca | Uso |
|---|---|
| `jose` | Assinatura/verificação e parsing de JWT no servidor |
| `dompurify` | Sanitização de HTML |
| `imask` / `react-imask` | Máscaras de input |

Chaves públicas RSA, `SECRET_KEY` de sessão e `API_USER_KEY` vêm de env (ver `.env.example`);
nunca commitadas. Ver [`security.md`](security.md).

## Qualidade e build

| Ferramenta | Uso |
|---|---|
| ESLint 9 (flat, `eslint.config.mjs`) | `js.recommended` + `react.flat.recommended` + `next/core-web-vitals` + `typescript-eslint.recommended` + `prettier`; `import-helpers/order-imports` |
| Prettier 3 | `singleQuote`, `semi`, `trailingComma: all`, `tabWidth: 2`, `endOfLine: lf` |
| `typescript-eslint` com `projectService` | Regras type-aware |
| Jest 30 + `jest-environment-jsdom` + Testing Library (`react`, `jest-dom`) | Testes de unidade/componente (`next/jest`) |
| Storybook 10 (`@storybook/nextjs`, addon-a11y, addon-themes) | Catálogo de componentes + verificação de acessibilidade |
| `knip` | Detecção de código/dep morto |
| Husky + `lint-staged` + `@commitlint/config-conventional` | Hooks de commit (Conventional Commits — ver `_shared/git-workflow.md`) |
| SonarQube | `sonarqube.apps.ioc.bcloud.sfb` — projeto `wib.transacional-ibanking-web.*` |

## Infra

- **Deploy:** OpenShift (`apps.ioc.*.bcloud.sfb`); `configuration/configmap/<app>.yml` +
  `configuration/secret/<app>.yml`, só de desenvolvimento, entregues por `envFrom`; homologação e
  produção são configurados fora do repositório, e o `Secret` de dev segue a exceção de
  [`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.2 e §5.
- **Escuta do processo:** `PORT` e `HOSTNAME` são definidos **num único lugar, documentado** (o
  `ConfigMap`), iguais em qualquer forma de build (`HOSTNAME=0.0.0.0`; o sistema de referência usa
  `PORT=8080`). A plataforma injeta `HOSTNAME` com o nome do pod, e o servidor passa a escutar só
  nesse nome: a sonda falha mesmo com a aplicação de pé.
- **Artefato:** `output: 'standalone'`. `npm run build` produz um artefato executável **sem passos
  externos** (os estáticos de `.next/static` e o `public/` já dentro dele) e `npm start` o executa.
  Scripts de `package.json` portáveis entre sistemas operacionais (SHOULD): sem `cp -r`, `rm -rf` nem
  variável de ambiente em sintaxe POSIX.
- **Observabilidade:** AppDynamics (`NEXT_PUBLIC_APPDYNAMICS_ID`), Google Analytics (`@next/third-parties`).
- **Segurança de sessão do dispositivo:** Topaz / Warsaw (OFDB) — `NEXT_PUBLIC_TPZ_SESSION_ID`.
- Certificado corporativo: `NODE_EXTRA_CA_CERTS=./ca_banestes.pem`. O caminho é relativo ao diretório
  de execução: no artefato standalone o `.pem` precisa estar copiado para dentro dele.

## Versionamento

Versões fixas via `package-lock.json` commitado. Ver `_shared/vulnerable-and-proprietary-libs.md`
(política de CVE e `npm audit` no pipeline).
