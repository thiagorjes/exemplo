# Testes — Frontend Next.js

> Config real: `jest.config.mjs` (`next/jest`), `jest.setup.js`, `tsconfig` (`types: jest,
> @testing-library/jest-dom`). Ambiente `jest-environment-jsdom`.
> A configuração de Jest da SPA (Vite) difere da do `next/jest`: não copie `jest.config`, `setup`
> nem mapeamento de módulos de uma coleção para a outra.

## 1. Estratégia por tipo

| Alvo | Ferramenta | Foco |
|---|---|---|
| Funções puras (`utils/`, `schemas/`, `routes/`, `lib/feature-access`) | Jest | Entrada → saída; casos de borda; parsing de schema Zod |
| Hooks | Testing Library (`renderHook`) | Estado e efeitos observáveis |
| Componentes | Testing Library (`render`, `screen`, `userEvent`) | Comportamento visível ao usuário, não implementação |
| Route handlers (`app/api/*`) | Jest | Status semântico, corpo modelado, tratamento de erro do upstream (mock do axios) |
| Acessibilidade / visual | Storybook 10 + `addon-a11y` | Estados do componente e violações a11y |

## 2. Convenções

- Arquivo `*.test.ts(x)` em `__tests__/` colocado ao lado do alvo (padrão já usado em
  `utils/**/__tests__`, `components/__tests__`, `routes/__tests__`, `lib/feature-access/__tests__`).
- `testMatch`: `src/**/*.{test,spec}.{js,jsx,ts,tsx}`. `passWithNoTests` ligado — ausência de
  teste não quebra o build, mas ver DoD.
- Alias `@/` resolvido no Jest (`moduleNameMapper`).

## 3. Testing Library — regras

- Consultar por papel/label/texto (`getByRole`, `getByLabelText`), nunca por classe CSS ou
  `data-testid` a não ser em último caso.
- Interação com `userEvent`, não `fireEvent`.
- `findBy*` / `waitFor` para assíncrono; sem `act` manual desnecessário.
- Mock de rede: mockar o módulo `@/lib/axios` ou a camada de fetch — não a API real.
- Testar o que o usuário vê e faz; não asserir sobre estado interno de hook/Redux.

## 4. Schemas Zod

Todo schema de domínio em `src/schemas/` tem teste cobrindo: valor válido, cada regra de
rejeição, e coerção/transform quando houver.

## 5. Cobertura

Ver [`definition-of-done.md`](definition-of-done.md). A cobertura é gerada pelo teste e lida pelo
SonarQube; o gate de código novo é o do servidor, sem limiar numérico na biblioteca
([`../_shared/sonarqube.md`](../_shared/sonarqube.md)). Prioridade de cobertura: `utils/`,
`schemas/`, `lib/feature-access`, route handlers e fluxos críticos (login, PIX, pagamento).

## 6. Protocolo para a IA

1. Ao criar componente/hook/util, criar o `__tests__/` correspondente na mesma pasta.
2. Query por acessibilidade; interação com `userEvent`.
3. Mockar `@/lib/axios`, nunca chamar gateway.
4. Para route handler, cobrir 2xx, erro de validação (400), regra de negócio (409/422) e erro do
   upstream. Erro com código: afirmar que a UI mostra o texto do catálogo para `codigoRegra` (com
   `dadosApoio` interpolado), que sem entrada cai no catálogo da categoria e, sem catálogo, no
   `detail`; erro de campo mostra o `message` junto do campo. Lista paginada: fixture de página
   plana `{ content, page, size, totalElements, totalPages }`.
5. Não silenciar teste flaky com `skip` — corrigir a causa (timer, await, cleanup).
6. **Smoke do artefato:** depois do `npm run build`, subir o artefato com `npm start` e conferir que
   `/health` responde `200` sem sessão e sem `3xx`, e que o HTML aponta para CSS e JS que carregam
   (`200`). O CI roda este passo nas mesmas condições do build da esteira.
