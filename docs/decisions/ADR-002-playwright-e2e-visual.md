---
id: ADR-002
type: ADR
status: accepted
date: 2026-10-22
supersedes: —
superseded-by: —
---

# ADR-002 — Playwright como ferramenta de e2e, com execução visual (headed) por padrão

## Decisão

A suíte e2e da demo `cadastro-clientes` usa **Playwright** (TypeScript), configurada para
rodar em **modo headed por padrão** (`headless: false`, navegador visível, com os passos
executando em velocidade observável por um humano). Um modo headless equivalente fica
disponível para execução em CI, mas o modo padrão e o que esta entrega precisa demonstrar é o
visual — é o próprio objetivo declarado desta demonstração do flow IDSD.

## Motivação

`frontend/nextjs/testing.md` cobre unitário (Jest), componente/hook (Testing Library) e
visual/a11y de componente isolado (Storybook) — nenhuma ferramenta de e2e de navegador real
está coberta pela coleção hoje.

**Problema que resolve:**
A maioria dos 27 cenários do PRD (`docs/prd/cadastro-clientes-prd.md`) é do tipo `e2e` — fluxos
de ponta a ponta (login, cadastro de cliente, logout) que atravessam Next.js (BFF) + API Node.
O demandante pediu explicitamente, mais de uma vez, que essa suíte seja executada de forma
visível, não apenas headless — é a prova visual de que o flow IDSD produz um sistema que
funciona de verdade, não só artefatos de papel.

**Restrições consideradas:**
- Precisa rodar contra o BFF Next.js real (não um mock de componente).
- Precisa de um modo visual (navegador aberto, interação observável) como caminho padrão desta
  demo, sem deixar de permitir headless para uso futuro em CI.
- Sem infraestrutura corporativa de execução de e2e disponível (ambiente é só local/demo).

## Consequências

**Positivas:**
- Cobre exatamente o tipo de cenário que domina o PRD (`e2e`).
- API de auto-espera (`await expect(locator)...`) reduz flakiness sem sleep manual.
- Suporta `headless: false` e modo "slow motion" nativamente, sem plugin extra.

**Negativas / trade-offs:**
- Introduz uma ferramenta nova na coleção `frontend/nextjs`, que hoje não tem e2e de navegador —
  fica registrado aqui como desvio pontual desta feature, a materializar na coleção
  (`governance/guidelines/frontend/nextjs/testing.md`) se outro sistema vier a precisar do mesmo.
- Execução headed é mais lenta e não roda num ambiente sem display — por isso o modo headless
  continua disponível para CI; só o padrão de demonstração é visual.

**Downstream afetado:**
- `/tests` (próxima etapa do flow) escreve os testes Playwright a partir dos cenários
  congelados do PRD.
- `docs/techspec/cadastro-clientes/quickstart.md` documenta o comando de execução.

## Alternativas Consideradas

### Alternativa 1 — Cypress
**Descartada porque:** o modo headed do Cypress é mais pesado para alternar com CI (duas
configurações de runner distintas), e o suporte a múltiplas abas/contextos de navegador (útil
para o cenário SCN-006.3 de edição concorrente) é mais direto no Playwright.

### Alternativa 2 — Testing Library + jsdom para os fluxos "e2e" do PRD
**Descartada porque:** jsdom não é um navegador real — não exercita o BFF Next.js de ponta a
ponta nem produz uma execução visível, que é exatamente o requisito que motivou esta decisão.
