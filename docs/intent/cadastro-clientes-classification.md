# Classificação — cadastro-clientes

> Artefato de Controle. Resolve o flow aplicável a partir do Intent.
> Conservadora por construção: na dúvida entre duas classes, escolha a de
> maior exigência de gates.
> IDSD 4.3 — **Gate:** GATE-CLASSIFY

- **Intent de origem:** `docs/intent/cadastro-clientes-intent.md`
- **Data:** 2026-10-22
- **Classificado por:** agente

---

## Classificação

| Eixo | Valor | Justificativa em uma linha |
| --- | --- | --- |
| Tipo | feature | Comportamento novo — sistema de cadastro de clientes e login não existe hoje (substitui planilhas/drive). |
| Domínio | cadastro-de-clientes | Primeiro domínio deste sistema (greenfield); não há mapa de domínios prévio a conciliar. |
| Risco | alto | Toca autenticação (login) e trata dado pessoal de cliente, com o demandante declarando vazamento/acesso indevido como risco explícito a evitar — ambos são sinais de risco alto independentes do tamanho da entrega. |
| Impacto | local | Sistema novo e isolado, sem integração com outros sistemas do workspace nesta etapa. |

## Flow resolvido

- **Flow:** `governance/flows/feature.yaml`
- **Gates obrigatórios herdados da classe:** GATE-INTENT, GATE-DIRECAO, GATE-SPEC, GATE-PROVENIENCIA, GATE-CONSISTENCIA, GATE-RASTREABILIDADE, GATE-VERIFICACAO-INDEPENDENTE, GATE-GHERKIN-CONGELADO, GATE-NFR, GATE-REVISAO-TECNICA (classe `feature`) + núcleo inegociável GATE-CLASSIFY, GATE-CONTEXT, GATE-EVIDENCIA, GATE-DADOS.

## Override

> Preencher apenas se a classificação automática foi alterada por humano.
> Override sem autor e motivo é inválido e reprova o gate.

- **Classificação original:**
- **Classificação após override:**
- **Autor:**
- **Motivo:**
- **Data:**

## Reclassificação

> Se o `/discovery` ou qualquer etapa posterior revelar impacto maior que o
> classificado, a reclassificação é **obrigatória** e retroage: os gates da
> nova classe passam a valer, mesmo que a execução já esteja adiantada.

| Data | De | Para | O que revelou |
| --- | --- | --- | --- |

---

## Fora deste artefato — regras negativas

- **Descrição do problema ou da dor** → `/intent`.
- **Estimativa de esforço, prazo ou tamanho** → `/tasks`. Risco não é tamanho.
- **Decisão sobre como resolver** → `/shape`.
- **Lista de gates inventada pelo agente.** Os gates vêm da policy; este
  artefato apenas cita quais foram herdados.
- **Dispensa de gate.** Waiver é artefato próprio em `governance/waivers/`,
  assinado por humano, com validade.
