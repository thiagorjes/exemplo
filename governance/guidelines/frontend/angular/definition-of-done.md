# Definition of Done — Frontend Angular

Uma task está **concluída** quando todos os critérios obrigatórios forem atendidos.

## Obrigatórios

### Qualidade estática
- [ ] `ng lint` sem erro e sem warning novo (inclui fronteiras por `no-restricted-imports` e a11y de template)
- [ ] `ng build --configuration production` sem erro e dentro dos budgets do `angular.json`:
      `initial` warning 500 kB / error 1 MB; `anyComponentStyle` warning 4 kB / error 8 kB
- [ ] `npx prettier --check .` sem diferença
- [ ] `npx knip` sem código/dependência morta introduzida
- [ ] Sem `any`, sem `NgModule`, sem `zone.js`, sem `@ts-ignore`/`eslint-disable` sem justificativa
- [ ] SonarQube: sem issue Blocker/Critical nova (ver [`../_shared/sonarqube.md`](../_shared/sonarqube.md))

### Testes
- [ ] `npm test` (`jest`) verde
- [ ] Componente, store, API client, pipe, guard ou interceptor novo com `.spec.ts` ao lado
- [ ] Schema Zod novo com teste de aceitação e de rejeição
- [ ] API client novo com teste de 2xx, payload inválido e Problem Details
- [ ] Fluxo crítico alterado com e2e Playwright verde

### Contrato e dados
- [ ] Backend acessado só por `data-access` → `/api/*` do BFF
- [ ] Erro HTTP tratado como Problem Details ([`_shared/api-standards.md`](../../_shared/api-standards.md))
- [ ] Estado de servidor fora do store global; config só via `APP_CONFIG`
- [ ] Rotas e paths por constantes, sem string solta

### Segurança
- [ ] Contrato BFF respeitado ([`../_shared/spa-bff.md`](../_shared/spa-bff.md)): nenhum token ou lib OIDC no browser
- [ ] Permissão nova ou renomeada: constante igual ao EPA em `docs/iep/`, com teste de literais; recurso que a exige só requisita com ela
- [ ] Nenhum `bypassSecurityTrust*` sem DR; links externos com `rel="noopener noreferrer"`
- [ ] Nada sensível em log
- [ ] `npm audit` sem CVE Critical/High pendente ([`_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md))
- [ ] Versões dentro da janela de [`../_shared/version-policy.md`](../_shared/version-policy.md)

### Acessibilidade e design
- [ ] Alvo de [`../_shared/design-principles.md`](../_shared/design-principles.md) atendido; addon-a11y e axe sem violação nova
- [ ] Só tokens do design system ([`design-system.md`](design-system.md)); sem valor avulso
- [ ] Story criada/atualizada para primitivo novo ou alterado, nos dois temas

### UX de erro e carregamento
- [ ] Estados de carregando, vazio e erro tratados; `@defer` com `@placeholder`/`@loading` quando usado

### Esteira
- [ ] Passos mínimos da esteira de frontend cumpridos, conforme a lista em
      [`_shared/operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.1
- [ ] Variável nova do BFF no `configuration/configmap/<app>.yml` ou no `configuration/secret/<app>.yml` (só desenvolvimento, chave sem ponto), com hml e prod configurados fora do repositório; chave nova de `config.json` no valor da variável que o BFF serve, nunca como arquivo ou volume ([`_shared/operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.2)

## Recomendados

- [ ] `@defer` para blocos pesados abaixo da dobra
- [ ] README do sistema atualizado se houve rota, chave de `config.json` ou mudança de execução

## Checklist de code review

- [ ] `OnPush` + Signal APIs + control flow nativo
- [ ] Derivação em `computed`; nenhum `effect` derivando estado
- [ ] Presentational sem store; feature sem import de outra feature
- [ ] `subscribe` manual com `takeUntilDestroyed`
- [ ] `track` real em `@for`
- [ ] Reactive Form tipado (`nonNullable`), validação espelhando o schema Zod
