# Guidelines

Biblioteca de normas técnicas do workspace. É **compartilhada entre sistemas**: as
coleções são organizadas por stack, não por sistema, porque `backend/java` vale
para todo sistema Java e não para um só.

Cada sistema declara quais coleções o governam em `guidelines.yaml`, na raiz do
sistema.

---

## Organização

```
guidelines/
  _shared/              transversais, agnósticas de stack
  _templates/           molde para criar uma coleção nova
  <camada>/
    _shared/            transversais daquela camada (opcional)
    <stack>/            a coleção concreta
```

`<camada>` não é um conjunto fechado — hoje há `backend/` e `frontend/`, e
`mobile/`, `data/` ou `infra/` entram do mesmo jeito quando existirem. `<stack>`
é a linguagem ou o framework que decide o "como" (`java`, `nextjs`, `dotnet`,
`python`…).

**A regra que sustenta a divisão:** se trocar a stack torna a frase falsa, a
frase pertence à coleção da stack. Se continua verdadeira, pertence a `_shared/`.
"Erro 4xx não é logado como `error`" é transversal; "usar `@Slf4j` do Lombok" é
de `backend/java`.

---

## Transversais

| Arquivo | Decide |
| --- | --- |
| [`_shared/architecture-principles.md`](_shared/architecture-principles.md) | Screaming architecture, camadas e direção de dependência |
| [`_shared/api-standards.md`](_shared/api-standards.md) | Contrato HTTP: status, payload de erro, paginação, versionamento |
| [`_shared/api-security.md`](_shared/api-security.md) | Autenticação, autorização e endurecimento de APIs expostas |
| [`_shared/logging-and-levels.md`](_shared/logging-and-levels.md) | O que registrar e em que nível |
| [`_shared/vulnerable-and-proprietary-libs.md`](_shared/vulnerable-and-proprietary-libs.md) | Política de dependências: CVE, aprovação, libs internas |
| [`_shared/git-workflow.md`](_shared/git-workflow.md) | Conventional Commits, branches, PR, revisão e aprovações |
| [`_shared/operations-and-readiness.md`](_shared/operations-and-readiness.md) | Sondas, validação do artefato no ambiente-alvo, implantação com migração de banco na esteira, configuração versionada em `configuration/<tipo>/<app>.yml` (só dev, `envFrom`), nomes acoplados, pedidos de infraestrutura, segredos e configuração local |
| [`_shared/identity-rhsso.md`](_shared/identity-rhsso.md) | RH-SSO na prática: IEP, EPA e trancode por tela (permissões externas), claims `bns*`, cliente no realm, origem pública, sessão, validação no realm real |
| [`_shared/data-protection.md`](_shared/data-protection.md) | Regras técnicas de dado pessoal: classificação, dados de teste, log, acesso, cifra, eliminação, direitos do titular |
| [`_shared/nonfunctional-defaults.md`](_shared/nonfunctional-defaults.md) | Metas de desempenho e prazos de retenção padrão, até a área dona decidir outros |

Transversais de camada (`frontend/_shared/`):

| Arquivo | Decide |
| --- | --- |
| [`frontend/_shared/design-principles.md`](frontend/_shared/design-principles.md) | Método de design, agnóstico de framework |
| [`frontend/_shared/design-tokens.json`](frontend/_shared/design-tokens.json) | Valores dos tokens Banestes — fonte única para todas as stacks |
| [`frontend/_shared/design-system-common.md`](frontend/_shared/design-system-common.md) | Design system comum às stacks: papéis dos tokens, dimensões, iconografia, tema, acessibilidade e API dos primitivos |
| [`frontend/_shared/tailwind-4-tokens.md`](frontend/_shared/tailwind-4-tokens.md) | Tokens no Tailwind 4 (React e Angular): escala de espaçamento fora do `@theme`, `dark:`, `--text-*--line-height` |
| [`frontend/_shared/typescript-and-imports.md`](frontend/_shared/typescript-and-imports.md) | TypeScript, ordem de imports e estilo de código comuns às stacks de frontend |
| [`frontend/_shared/spa-bff.md`](frontend/_shared/spa-bff.md) | Contrato de segurança de SPA: BFF obrigatório, sessão por cookie, CSRF, CSP |
| [`frontend/_shared/version-policy.md`](frontend/_shared/version-policy.md) | Janela de versões (duas linhas suportadas) e gatilhos de revisão |
| [`frontend/_shared/sonarqube.md`](frontend/_shared/sonarqube.md) | Regras Sonar web |

---

## Coleções por stack

| Coleção | Stack | Status |
| --- | --- | --- |
| [`backend/java`](backend/java/) | Java + Spring Boot | elaborada |
| [`backend/node`](backend/node/) | Node 24 + Express (exceção — ver [ADR-001](../../docs/decisions/ADR-001-backend-node-para-demo-idsd.md)) | elaborada |
| [`frontend/nextjs`](frontend/nextjs/) | Next.js 16 + React 19 + TS 6 | elaborada |
| [`frontend/react`](frontend/react/) | React 19 SPA + Vite 8 + TS 6 | elaborada |
| [`frontend/angular`](frontend/angular/) | Angular 22 + TS 6 | elaborada |

> Coleção "não elaborada" é um diretório com apenas um `README.md` declarando o
> estado e apontando o template. Existe de propósito: dívida declarada é
> diferente de ausência silenciosa.

---

## Arquivos de uma coleção

**Obrigatórios** — `stack.md`, `architecture.md`, `coding-standards.md`,
`testing.md`, `definition-of-done.md`.

**Condicionais** — `<framework>.md`, `database.md` (com um `database-<banco>.md` por banco
suportado), `integrations.md`,
`openapi-swagger.md`, `sonarqube.md`, `security.md`, e, para frontend com UI,
`design-system.md` + `design-tokens.json` + `components/` (os tokens podem viver no
`_shared/` da camada quando compartilhados entre stacks).

Detalhe do que cada um deve conter: [`_templates/stack-guidelines-template.md`](_templates/stack-guidelines-template.md).

---

## Gerar guidelines para uma nova stack

Rode a skill `/guidelines` do sistema. Ela conduz a entrevista, materializa os
transversais na stack concreta e mantém a tabela acima. Manualmente, o caminho é
o mesmo:

1. Criar `<camada>/<stack>/`.
2. Preencher `stack.md` primeiro — ele decide o resto.
3. Copiar os obrigatórios do template; acrescentar os condicionais aplicáveis.
4. Cross-linkar cada arquivo com o `_shared/` que ele materializa.
5. Acrescentar a linha na tabela de coleções deste README.
6. Declarar a coleção no `guidelines.yaml` dos sistemas que a usam.

**Não duplique o transversal.** Onde `_shared/` já decidiu, linke e mostre só a
implementação. Duplicar cria duas versões da mesma regra que divergem em
silêncio — e a versão errada é sempre a que alguém leu.

---

## O que não entra aqui

Inventário de telas, componentes de rota, dívidas de design de um codebase
específico e decisões de uma feature são artefatos **do sistema**, não da
biblioteca. Guideline responde "como se faz nesta stack"; o sistema responde "o
que existe aqui".

A fonte da verdade executável continua sendo a configuração de lint, build e
teste de cada sistema. Estes documentos resumem o contrato e cobrem o que as
ferramentas não capturam.
