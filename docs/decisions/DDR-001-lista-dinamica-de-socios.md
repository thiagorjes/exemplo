---
id: DDR-001
type: DDR
status: accepted
date: 2026-10-22
supersedes: —
superseded-by: —
---

# DDR-001 — Lista dinâmica de sócios no cadastro de cliente PJ

## Decisão

O formulário de cadastro de cliente Pessoa Jurídica usa um padrão de grupo de
campos repetível (adicionar/remover linha) para a lista de sócios (nome
completo + CPF por sócio), sem limite de quantidade. É composto a partir dos
primitivos já existentes do design system (`Input`, `Button` secundário para
"adicionar sócio", `Button` ghost/ícone para remover uma linha) — não introduz
nenhum token novo.

## Motivação

O design system Banestes (`frontend/_shared/design-system-common.md`) não tem,
hoje, um padrão de "lista de campos repetível" catalogado. O cadastro de
cliente PJ exige nomear um ou mais sócios (ver `docs/shape/cadastro-clientes-brief.md`
e `docs/discovery/cadastro-clientes-discovery.md`), e o demandante confirmou
que não há limite de quantidade.

**Problema que resolve:**
Permitir cadastrar N sócios por cliente PJ sem redesenhar o formulário para
cada quantidade.

**Restrições consideradas:**
- Sem limite de sócios (confirmado pelo demandante).
- Não introduzir componente ou token fora da coleção `frontend/nextjs` existente.

## Consequências

**Positivas:**
- Reaproveita 100% dos primitivos já existentes; nenhuma dependência nova.
- Padrão fica disponível para qualquer formulário futuro que precise de lista
  repetível.

**Negativas / trade-offs:**
- Sem paginação/scroll definido para uma lista muito longa de sócios — aceito
  nesta entrega por ser uma demonstração, não produção.

**Downstream afetado:**
- `docs/design/cadastro-clientes/screen-map.md` e o protótipo da tela de
  incluir/editar cliente.

## Alternativas Consideradas

### Alternativa 1 — Campo de texto único com sócios separados por vírgula
**Descartada porque:** reabre o mesmo problema de "campo livre sem validação"
que esta entrega existe para resolver (ver discovery, dor #3).

### Alternativa 2 — Limitar a um número fixo de sócios com campos estáticos
**Descartada porque:** o demandante declarou explicitamente que não há limite.
