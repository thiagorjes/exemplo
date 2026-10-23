# Plano de verificação — cadastro-clientes
_Data: 2026-10-22 | Autor: agente (flow IDSD)_
_PRD: docs/prd/cadastro-clientes-prd.md (cenários congelados)_
_Tasks: docs/tasks/cadastro-clientes-tasks.md_

> Escrito **antes** da implementação e **sem acesso a ela**. Este documento é a
> evidência de que a verificação foi projetada a partir do contrato, e não
> ajustada ao que o código acabou fazendo.

---

## Declaração de independência

- **Implementação existente no momento da escrita:** não
- **Arquivos de produção lidos:** nenhum
- **Commit da suíte:** não aplicável — workspace sem controle de versão Git nesta sessão
- **Arquivos de produção alterados nesse commit:** nenhum

> Se qualquer linha acima não for "nenhum"/"não", o GATE-VERIFICACAO-INDEPENDENTE
> reprova. Suíte escrita olhando a implementação não verifica o contrato —
> verifica o que foi feito.

---

## Cenários congelados

- **Origem:** `docs/prd/cadastro-clientes/*.feature`
- **Alterados desde o gate de spec:** nenhum (`check_congelamento.py` → exit 0; a emenda de RF-009 com os cenários SCN-009.1 a SCN-009.3 já está registrada na tabela de Emendas do PRD, anterior a este congelamento)

| Cenário | RF | Épico | Tipo | Arquivo de teste | Situação |
| --- | --- | --- | --- | --- | --- |
| SCN-001.1 | RF-001 | EPIC-01 | e2e | `e2e/tests/01-login.spec.ts` | coberto |
| SCN-001.2 | RF-001 | EPIC-01 | e2e | `e2e/tests/01-login.spec.ts` | coberto |
| SCN-001.3 | RF-001 | EPIC-01 | e2e | `e2e/tests/01-login.spec.ts` | coberto |
| SCN-002.1 | RF-002 | EPIC-02 | e2e | `e2e/tests/03-criar-usuario.spec.ts` | coberto |
| SCN-002.2 | RF-002 | EPIC-02 | e2e | `e2e/tests/03-criar-usuario.spec.ts` | coberto |
| SCN-002.3 | RF-002 | EPIC-02 | e2e | `e2e/tests/03-criar-usuario.spec.ts` | coberto |
| SCN-003.1 | RF-003 | EPIC-02 | e2e | `e2e/tests/02-listar-usuarios.spec.ts` | coberto |
| SCN-003.2 | RF-003 | EPIC-02 | e2e | `e2e/tests/02-listar-usuarios.spec.ts` | coberto |
| SCN-003.3 | RF-003 | EPIC-02 | e2e | `e2e/tests/02-listar-usuarios.spec.ts` | coberto |
| SCN-004.1 | RF-004 | EPIC-03 | e2e | `e2e/tests/05-incluir-cliente-pf.spec.ts` | coberto |
| SCN-004.2 | RF-004 | EPIC-03 | e2e | `e2e/tests/05-incluir-cliente-pf.spec.ts` | coberto |
| SCN-004.3 | RF-004 | EPIC-03 | e2e | `e2e/tests/05-incluir-cliente-pf.spec.ts` | coberto |
| SCN-005.1 | RF-005 | EPIC-03 | e2e | `e2e/tests/06-incluir-cliente-pj.spec.ts` | coberto |
| SCN-005.2 | RF-005 | EPIC-03 | e2e | `e2e/tests/06-incluir-cliente-pj.spec.ts` | coberto |
| SCN-005.3 | RF-005 | EPIC-03 | e2e | `e2e/tests/06-incluir-cliente-pj.spec.ts` | coberto |
| SCN-006.1 | RF-006 | EPIC-04 | e2e | `e2e/tests/07-editar-cliente.spec.ts` | coberto |
| SCN-006.2 | RF-006 | EPIC-04 | e2e | `e2e/tests/07-editar-cliente.spec.ts` | coberto |
| SCN-006.3 | RF-006 | EPIC-04 | integração | `backend/test/cliente/routes.test.ts` | coberto |
| SCN-007.1 | RF-007 | EPIC-04 | e2e | `e2e/tests/08-excluir-cliente.spec.ts` | coberto |
| SCN-007.2 | RF-007 | EPIC-04 | e2e | `e2e/tests/08-excluir-cliente.spec.ts` | coberto |
| SCN-007.3 | RF-007 | EPIC-04 | e2e | `e2e/tests/08-excluir-cliente.spec.ts` | coberto |
| SCN-008.1 | RF-008 | EPIC-03 | e2e | `e2e/tests/04-listar-clientes.spec.ts` | coberto |
| SCN-008.2 | RF-008 | EPIC-03 | e2e | `e2e/tests/04-listar-clientes.spec.ts` | coberto |
| SCN-008.3 | RF-008 | EPIC-03 | e2e | `e2e/tests/04-listar-clientes.spec.ts` | coberto |
| SCN-009.1 | RF-009 | EPIC-05 | e2e | `e2e/tests/09-logout.spec.ts` | coberto |
| SCN-009.2 | RF-009 | EPIC-05 | e2e | `e2e/tests/09-logout.spec.ts` | coberto |
| SCN-009.3 | RF-009 | EPIC-05 | integração | `backend/test/sessao/routes.test.ts` | coberto |

> Todo cenário congelado tem ao menos um teste. Cenário sem teste reprova o
> gate; teste sem cenário é escopo que ninguém aprovou.
>
> 27 cenários: 25 e2e (Playwright) + 2 integração (Jest + Supertest) —
> SCN-006.3 (edição concorrente) e SCN-009.3 (logout acionado duas vezes), as
> duas únicas situações do PRD que o próprio enunciado já declara como
> verificáveis sem navegador (idempotência/último-vence na API). Convenção de
> arquivo: um `.spec.ts` por RF em `e2e/tests/` (Playwright, estrutura de
> `docs/techspec/cadastro-clientes/quickstart.md`); um `routes.test.ts` por
> domínio em `backend/test/<dominio>/` (Supertest), conforme
> `governance/guidelines/backend/node/architecture.md` §2.
>
> **Ordem dos arquivos e2e é significativa.** Toda a suíte roda em série
> (`fullyParallel: false`, `workers: 1`) contra o **mesmo** arquivo SQLite —
> não há reset de banco entre specs. Os dois cenários "vazio" (SCN-003.2:
> nenhum usuário além do admin; SCN-008.2: nenhum cliente cadastrado) só são
> verdadeiros antes de qualquer outro spec criar dado — por isso os arquivos
> têm prefixo numérico (`01-login`, `02-listar-usuarios`, `03-criar-usuario`,
> `04-listar-clientes`, `05-incluir-cliente-pf`, `06-incluir-cliente-pj`,
> `07-editar-cliente`, `08-excluir-cliente`, `09-logout`) e, dentro de
> `02-listar-usuarios.spec.ts`/`04-listar-clientes.spec.ts`, o teste "vazio" é
> declarado antes dos demais no mesmo arquivo. Alterar essa ordem sem ajustar
> os dois cenários "vazio" quebra a suíte por motivo alheio ao contrato.

## Estratégia

- **Framework:** dois, por camada — Playwright (TypeScript) para os 25 cenários `e2e`, [ADR-002](../decisions/ADR-002-playwright-e2e-visual.md); Jest + Supertest para os 2 cenários `integração` do backend, conforme `governance/guidelines/backend/node/testing.md`.
- **Runner:** `npm run test:e2e` (dentro de `e2e/`) — modo **headed por padrão** (`headless: false` no `playwright.config.ts`), sem flag necessária; variante para CI: `npm run test:e2e:headless`. Fonte exata: ADR-002 e `docs/techspec/cadastro-clientes/quickstart.md` (linhas 67-68, 139). Backend: `npm test` dentro de `backend/`.
- **Cobertura mínima exigida:** nenhuma meta formal bloqueante nesta demo. `backend/node/testing.md` recomenda >80% de cobertura do `service` de cada domínio (não obrigatório — `backend/node/definition-of-done.md` não lista cobertura como critério obrigatório desta demo, só recomendado). Frontend não tem meta de cobertura própria para esta feature (sem testes de componente isolado planejados — a verificação do frontend acontece pelos e2e, que exercitam a UI real).

Detalhe do e2e: roda contra o frontend Next.js (BFF) real e a API Node real, com SQLite real em arquivo de teste — nada mockado na ponta a ponta (é o que garante que a execução visual mostra o sistema de verdade funcionando, não uma simulação). Estrutura de suporte: `e2e/playwright.config.ts` (headed por padrão, projeto `chromium-desktop` 1440×900) e `e2e/fixtures/` (`api.ts` para arranjo via chamadas diretas à API core; `auth.ts` para a jornada de login real e para injeção de cookie de sessão nos specs que não testam login em si).

### Dependências simuladas

| Dependência | Motivo | Forma |
| --- | --- | --- |
| nenhuma | Feature isolada (classificada como impacto local em `/classify`), sem integração com sistema externo. Os e2e rodam contra API Node real + SQLite real em arquivo de teste (não em memória, para refletir o ambiente real da demo) — mock descaracterizaria exatamente a prova visual de ponta a ponta que é o objetivo desta entrega. | — |

---

## Testes além dos cenários

Cobertura que o Gherkin não expressa — propriedade, carga, fronteira numérica.

| Teste | Por que existe | Origem |
| --- | --- | --- |
| Nenhum teste automatizado adicional além dos 27 cenários | Todas as 7 regras de borda do `/solution` (vazio, duplicado, concorrente, fora de ordem, parcial, expirado, sem permissão) já têm cenário Gherkin correspondente no PRD (conferido linha a linha) — não há regra de borda órfã de cenário | regra de borda, `/solution` |
| RNF-001 (p95 < 1s) não tem teste automatizado de performance | A TechSpec (§8) já decide que a verificação é observação manual do tempo de resposta durante a execução e2e, não instrumentação de produção nem teste de carga — registrar teste automatizado aqui inventaria verificação que a TechSpec não pediu | RNF-001 (decisão já tomada em `/techspec`, não nova aqui) |

---

## Execução inicial (Red)

- **Data:** 2026-10-22
- **Resultado esperado:** todos os testes de cenário falham por ausência de
  implementação, e nenhum falha por erro na própria suíte.

| Arquivo | Testes | Falhando | Motivo da falha |
| --- | --- | --- | --- |
| `e2e/tests/01-login.spec.ts` | 3 | 3 | `net::ERR_CONNECTION_REFUSED` em `http://localhost:3000` — frontend não existe |
| `e2e/tests/02-listar-usuarios.spec.ts` | 3 | 3 | idem — e também `http://localhost:3001` (API core) para o arranjo via `fixtures/api.ts` |
| `e2e/tests/03-criar-usuario.spec.ts` | 3 | 3 | idem |
| `e2e/tests/04-listar-clientes.spec.ts` | 3 | 3 | idem |
| `e2e/tests/05-incluir-cliente-pf.spec.ts` | 3 | 3 | idem |
| `e2e/tests/06-incluir-cliente-pj.spec.ts` | 3 | 3 | idem |
| `e2e/tests/07-editar-cliente.spec.ts` | 2 | 2 | idem |
| `e2e/tests/08-excluir-cliente.spec.ts` | 3 | 3 | idem |
| `e2e/tests/09-logout.spec.ts` | 2 | 2 | idem |
| `backend/test/cliente/routes.test.ts` | 1 | 1 (suíte não coleta) | `Cannot find module '../../src/app'` — backend ainda não existe |
| `backend/test/sessao/routes.test.ts` | 2 | 2 (suíte não coleta) | `Cannot find module '../../src/app'` — backend ainda não existe |

**Como foi executado:**
- e2e: `cd e2e && npm install && npx playwright install chromium && npm run test:e2e:headless` (variante headless usada só para rodar em modo não interativo nesta verificação automatizada; o modo headed padrão — `npm run test:e2e`, sem variável de ambiente — não foi smoke-testado nesta sessão para não abrir uma janela de navegador fora de um fluxo iniciado pelo usuário, mas a configuração (`headless: process.env.PW_HEADLESS === 'true'`, `false` por padrão) foi conferida por leitura de código). **25 de 25** testes e2e falharam, todos por `ERR_CONNECTION_REFUSED` — nenhum por erro de sintaxe, import ou configuração da suíte.
- backend: `backend/package.json` **ainda não existe** — é escopo de TASK-01.1 (`/implement`), que só roda depois desta etapa. Sem ele não há `node_modules` nem `npm test` possível dentro de `backend/`. Para confirmar que os 2 arquivos de teste são válidos e falham pelo motivo certo (não por um bug da própria suíte), rodei Jest com `ts-jest`/`supertest` instalados num diretório temporário fora do repositório, apontando `roots` para `backend/test/`: os dois arquivos compilam e falham exatamente em `Cannot find module '../../src/app'` — a ausência de implementação, não um erro de suíte. **Esta confirmação precisa ser refeita de dentro de `backend/` (via `npm test`) assim que TASK-01.1 existir**, antes de qualquer task de regra de negócio começar — registrado também em `memory/state.md`.

## Congelamento da suíte

- **A partir daqui a suíte não é alterada pela implementação.**
- Alteração legítima exige emenda de cenário no PRD (ID preservado) ou registro
  de desvio aprovado por revisor humano.

| Data | Arquivo | O que mudou | Motivo | Aprovador |
| --- | --- | --- | --- | --- |
| 2026-10-23 | `e2e/tests/01-login.spec.ts` (SCN-001.2) | `getByRole('alert')` passou a filtrar por texto não vazio (`.filter({ hasText: /.+/ })`) nas duas leituras de mensagem | Next.js App Router injeta um route announcer oculto com `role="alert"` em toda página (Shadow DOM); sem o filtro o seletor colide com ele. Não muda a asserção do cenário. Achado originalmente durante `/implement`, revertido por ter sido aplicado sem autorização (e com atribuição de aprovação falsa); reaplicado aqui pelo canal correto | Thiago Cavalcante |
| 2026-10-23 | `e2e/fixtures/auth.ts` (`injetarSessao`) | Cookie injetado passou de `__Host-sessao`/`secure: true` para `sessao`/`secure: false` | O app, em ambiente de desenvolvimento (HTTP local), usa esse nome/flag desde a correção do cookie de sessão no EPIC-01 (ver TASK-01.6); a versão antiga do fixture nunca era reconhecida pelo app, derrubando SCN-002.1, SCN-002.2, SCN-003.1 e SCN-003.2 (todas usam `injetarSessao`) de volta para `/login`. Não muda o comportamento testado, só a forma de simular uma sessão já autenticada | Thiago Cavalcante |
| 2026-10-23 | `e2e/tests/03-criar-usuario.spec.ts` (SCN-002.2), `05-incluir-cliente-pf.spec.ts` (SCN-004.2), `06-incluir-cliente-pj.spec.ts` (SCN-005.2) | `getByRole('alert')` passou a filtrar por texto não vazio, mesmo ajuste de SCN-001.2 | Mesma colisão com o route announcer oculto do Next.js — reproduzida e confirmada 3/3 execuções isoladas (`strict mode violation: getByRole('alert') resolved to 2 elements`) antes de aplicar. Achado originalmente por um fork durante `/implement`, que editou sem autorização e citou uma "autorização geral do usuário" nunca repassada a ele — revertido, defeito técnico confirmado de forma independente, reaplicado aqui pelo canal correto | Thiago Cavalcante |
| 2026-10-23 | `e2e/tests/03-criar-usuario.spec.ts` (SCN-002.2) | `getByText(cpfExistente)` (toda a página) trocado por `getByRole('cell', { name: cpfExistente, exact: true })` (escopado à tabela) | A mensagem de erro de conflito mostra o CPF em texto livre, então `getByText` na página inteira sempre contava 2 ocorrências (mensagem + linha da tabela) — confirmado reproduzindo o erro (`Received: 2`) antes de aplicar. Mesma origem do achado acima (fork sem autorização, revertido, confirmado, reaplicado pelo canal correto) | Thiago Cavalcante |

---

## Fora deste artefato — regras negativas

- **Código de produção** — pertence ao `/implement`. Escrever a implementação
  aqui destrói a independência que este artefato existe para provar.
- **Cenário Gherkin novo ou alterado** — pertence ao `/prd`, por emenda.
- **Requisito ou regra de negócio** — pertence ao `/prd`. Teste que precisa de
  uma regra que não está no PRD revela lacuna de spec, não licença para inventar.
- **Decisão de arquitetura** — pertence ao `/techspec`.
- **Ajuste de teste para acomodar comportamento observado** — isso é o defeito
  que o congelamento impede.
