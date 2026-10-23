---
id: ADR-001
type: ADR
status: accepted
date: 2026-10-22
supersedes: —
superseded-by: —
---

# ADR-001 — Backend Node/Express para a aplicação de demonstração do flow IDSD

## Decisão

A aplicação de demonstração do flow IDSD (login + cadastro de clientes) usa **Node 24 LTS +
Express** como backend "core", em vez da stack padrão obrigatória do workspace
(`backend/java`, Java + Spring Boot). A coleção `backend/node` é criada para governar este
desvio, conforme `backend/java/stack.md` exige.

## Motivação

**Problema que resolve:** o sistema existe para provar que o flow IDSD completo (guidelines →
intent → … → code-review) funciona ponta a ponta, com e2e visual (Playwright headed), e não para
entrar em produção como serviço bancário real. Montar a stack Java completa (Spring Boot, Flyway
na esteira Jenkins, OpenShift, Sonar `Banestes_way`, RH-SSO) introduziria fricção de
infraestrutura corporativa irrelevante para esse objetivo.

**Restrições consideradas:**
- O sistema não será implantado em produção nem em homologação do banco — roda só localmente,
  para a demonstração.
- O tempo de setup deve ser mínimo: o objetivo é validar o processo de governança, não a stack.
- O backend ainda precisa de um contrato HTTP real (`_shared/api-standards.md`) e de testes
  automatizados verificáveis — o desvio é de linguagem/framework, não de rigor.

## Consequências

**Positivas:**
- Setup e execução local mais simples (sem JVM, sem OpenShift, sem Nexus corporativo).
- Mesma linguagem (TypeScript) nas duas pontas (Next.js BFF e API Node), reduzindo a carga
  cognitiva de quem for ler o código da demo.

**Negativas / trade-offs:**
- A coleção `backend/node` não cobre os temas de infraestrutura corporativa do Java (RH-SSO,
  Sonar `Banestes_way`, SCA corporativo, Flyway na esteira) — ficam declarados como fora de
  escopo em `backend/node/definition-of-done.md`, com o motivo, em vez de omitidos em silêncio.
- Autenticação não usa RH-SSO real; ver [SDR-001](SDR-001-autenticacao-simplificada-sem-rhsso.md).

**Downstream afetado:**
- Nenhum sistema de produção depende desta decisão. A coleção `backend/node` fica disponível na
  biblioteca compartilhada para qualquer outra demo/protótipo que declare o mesmo desvio.

## Alternativas Consideradas

### Alternativa 1 — Java + Spring Boot (stack padrão)
**Descartada porque:** exigiria reproduzir infraestrutura corporativa (OpenShift, Nexus, esteira
Jenkins, Sonar `Banestes_way`) sem benefício para o objetivo da demo, que é validar o flow de
governança e o e2e visual, não a stack de produção.

### Alternativa 2 — Mock only, sem backend real (API simulada no próprio Next.js)
**Descartada porque:** não demonstraria a integração real entre BFF e um serviço "core"
separado, que é o padrão arquitetural (`frontend/_shared/spa-bff.md`) que o flow precisa provar
funcionando.
