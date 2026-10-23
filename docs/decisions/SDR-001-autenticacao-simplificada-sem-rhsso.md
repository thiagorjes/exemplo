---
id: SDR-001
type: SDR
status: accepted
date: 2026-10-22
supersedes: —
superseded-by: —
---

# SDR-001 — Autenticação simplificada (sem RH-SSO) na demo do flow IDSD

## Decisão

A tela de login da demo autentica contra a própria API `backend/node` (usuário + senha com hash
`scrypt`, `node:crypto`), que emite uma sessão opaca. O BFF Next.js guarda essa sessão num cookie
`HttpOnly`/`Secure`/`SameSite=Strict`, exatamente como `frontend/_shared/spa-bff.md` exige para o
cookie de sessão — a única mudança é a origem do login: API própria, não RH-SSO.

## Motivação

**Problema que resolve:** `_shared/api-security.md` e `frontend/_shared/spa-bff.md` assumem um
Identity Provider corporativo real (RH-SSO/Keycloak) com realm, client confidencial e JWKS. A
demo não tem acesso a um realm do RH-SSO e não precisa dele para provar que o flow IDSD produz um
sistema funcional com login e cadastro — precisa provar o **padrão** (browser nunca vê token,
sessão por cookie opaco, CSRF, BFF como única fronteira), não a integração com o IdP real.

**Restrições consideradas:**
- Sem acesso a um realm RH-SSO de teste fora da rede do banco.
- O objetivo da demo é mostrar o fluxo de ponta a ponta (tela → BFF → API → banco) e o e2e
  visual, não a integração de identidade corporativa.
- A estrutura de sessão (cookie, CSRF, `GET /auth/session`) do contrato de `spa-bff.md` continua
  valendo — só a emissão do token de identidade muda.

## Consequências

**Positivas:**
- Login funcional de ponta a ponta sem dependência externa — a demo roda isolada, inclusive em
  CI, sem precisar de um Keycloak de teste.
- O contrato de sessão (cookie opaco, CSRF, logout) é o mesmo de um sistema real: só a peça do
  IdP é trocada, não a arquitetura.

**Negativas / trade-offs:**
- Não valida a integração real com RH-SSO (token exchange RFC 8693, claims `bns*`, trancode por
  tela) — um sistema real precisaria repetir essa integração à parte, com o `_shared/identity-rhsso.md`.
- Senha armazenada localmente (hash `scrypt`) em vez de delegada a um IdP — aceitável só porque a
  base é de dados fictícios da demo, nunca dado real de cliente.

**Downstream afetado:** nenhum — decisão local a este sistema de demonstração.

## Alternativas Consideradas

### Alternativa 1 — Integração real com RH-SSO
**Descartada porque:** exige um realm de teste provisionado pelo time de identidade, fora do
alcance de uma demo que roda isolada; o ganho de fidelidade não justifica a dependência externa
para o objetivo (provar o flow IDSD, não a integração de identidade).

### Alternativa 2 — Sessão sem cookie (token no `localStorage`)
**Descartada porque:** viola diretamente `frontend/_shared/spa-bff.md` §1 (token nunca acessível
ao browser) — descaracterizaria a própria arquitetura que a demo deveria provar.
