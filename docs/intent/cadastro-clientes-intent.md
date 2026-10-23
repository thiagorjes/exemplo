# Intent — cadastro-clientes

> Artefato de Controle. Registra a intenção **nas palavras do demandante**.
> IDSD 4.2 — a intenção pertence a quem demanda. O agente transcreve e organiza;
> não traduz para linguagem técnica, não completa, não melhora.

- **Demandante:** Thiago Cavalcante — Coordenador
- **Data de captura:** 2026-10-22
- **Validado pelo demandante em:** 2026-10-22
- **Gate:** GATE-INTENT

---

## Resultado esperado

> O que precisa ser diferente no mundo depois que isto existir.
> Nas palavras do demandante, entre aspas quando for citação direta.

"precisamos ter um sistema para cadastro de pessoas (dados mínimos para
aberturas de conta corrente) com login onde haverá um gestor (que cadastra
usuários) e usuários que usam o sistema para cadastrar clientes. usuários não
compõem a lista de pessoas cadastradas para abertura de conta."

## Motivação

> Por que agora. O que dói hoje ou que oportunidade se perde.

"atualmente é tudo feito com planilhas e documentos em um drive compartilhado
e está ficando impossível de gerir."

## Limites declarados

> Restrições que o demandante já impõe: prazo, orçamento, sistema que não pode
> parar, decisão já tomada em outra instância.

| Limite | Origem | Negociável |
| --- | --- | --- |
| "tem que ficar pronto rápido, pois já estamos tendo problemas em encontrar dados de cliente" | demandante | a confirmar |

## Fora de escopo

> O que o demandante diz explicitamente que **não** quer. Registrar mesmo quando
> parecer óbvio — é o que evita ampliação silenciosa mais tarde.

"que acesso indevido vaze informações dos clientes"

## Interface

- **Tem interface visual:** sim
  <!-- Alimenta `intent.tem_interface`, que aciona /design no flow. -->

"precisamos de um sistema web para que todos os funcionários utilizem."

## Perguntas do agente ao demandante

| # | Pergunta | Resposta |
| --- | --- | --- |
| 1 | O que precisa estar diferente depois que isto existir? | "precisamos ter um sistema para cadastro de pessoas (dados mínimos para aberturas de conta corrente) com login onde haverá um gestor (que cadastra usuários) e usuários que usam o sistema para cadastrar clientes. usuários não compõem a lista de pessoas cadastradas para abertura de conta." |
| 2 | Por que agora? O que dói hoje, ou que oportunidade se perde se esperarmos? | "atualmente é tudo feito com planilhas e documentos em um drive compartilhado e está ficando impossível de gerir." |
| 3 | Que restrições já existem? Prazo, orçamento, decisão já tomada, sistema que não pode parar. | "tem que ficar pronto rápido, pois já estamos tendo problemas em encontrar dados de cliente" |
| 4 | O que você não quer que aconteça junto com isso? | "que acesso indevido vaze informações dos clientes" |
| 5 | Isso tem tela, ou é comportamento sem interface? | "precisamos de um sistema web para que todos os funcionários utilizem." |

---

## Fora deste artefato — regras negativas

Se você está prestes a escrever qualquer coisa abaixo, o conteúdo pertence a
outra etapa. Escreva lá, não aqui.

- **Requisito numerado (RF/RNF/RN)** → `/prd`. Aqui não há requisitos.
- **Solução, mecanismo ou tela** → `/solution` ou `/design`. Se o demandante
  propôs uma solução, registre como *limite declarado* com origem "proposta do
  demandante", nunca como decisão.
- **Tecnologia** → `/techspec`.
- **Diagnóstico da causa do problema** → `/discovery`. Aqui está a dor relatada,
  não a dor investigada.
- **Alternativas consideradas ou descartadas** → `/shape`.
- **Classificação de risco, tipo ou domínio** → `/classify`.
- **Reformulação do problema pelo agente.** Se o agente discorda do
  enquadramento, isso é assunto de `/discovery` — a Intent registra o que foi
  dito, não o que deveria ter sido dito.
