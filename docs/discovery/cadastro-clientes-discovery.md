# Discovery — cadastro-clientes

> D1 divergente. Explora contexto, dores e **enquadramentos alternativos** do
> problema. Não escolhe: abre.
> Sem gate próprio — alimenta o `/shape`, que converge e sai no GATE-DIRECAO.

- **Intent:** `docs/intent/cadastro-clientes-intent.md`
- **Contexto:** `docs/context/cadastro-clientes-context.md`
- **Data:** 2026-10-22

---

## Situação atual

> Como o trabalho acontece hoje, sem a solução. Descreva o processo real,
> incluindo as gambiarras — é nelas que mora o requisito não dito.

"o cliente envia as informações, seja por chat seja pessoalmente na loja, o
funcionário preenche a planilha e os documentos (contratos etc). salva tudo no
drive." — a planilha tem campos abertos, que "permitem inputar qualquer
coisa": não há validação de formato nem de obrigatoriedade no momento do
registro. (Thiago Cavalcante, relato em /discovery)

## Dores observadas

| # | Dor | Quem sente | Frequência | Evidência | Custo de conviver com ela |
| --- | --- | --- | --- | --- | --- |
| 1 | Encontrar dados de um cliente já cadastrado é demorado | Funcionário que atende o cliente | Diária — "toda vez que alguém busca um cliente" | Relato direto do demandante; sem ticket/planilha de medição anexada | "estamos perdendo oportunidades por conta na demora em recuperar as informações" |
| 2 | Gestão do cadastro (planilhas + drive) "está ficando impossível de gerir" | Gestor / coordenação | Não quantificada | Relato direto do demandante (Intent, Motivação) | Não detalhado além de "impossível de gerir" — suposição a validar |
| 3 | Campos livres da planilha aceitam qualquer entrada, sem padrão | Quem preenche e quem depois consulta o cadastro | Toda vez que um registro é criado | Relato direto do demandante (/discovery, Fase 1) | Não quantificado; presumível origem da dor #1 (dado inconsistente dificulta a busca) — relação ainda não confirmada pelo demandante |

> **Evidência** é dado, reclamação registrada, ticket, observação de campo.
> "É sabido que" não é evidência — sem fonte, marque como suposição a validar.

## Personas

| Persona | Contexto de uso | Objetivo | O que a frustra hoje |
| --- | --- | --- | --- |
| Usuário (funcionário que atende cliente) | Uso diário, ao atender cliente por chat ou na loja | Cadastrar e localizar dados de cliente para abertura de conta | Planilha com campos livres e dado disperso no drive; demora para achar cadastro existente |
| Gestor | Uso esporádico (quando precisa dar ou retirar acesso de um funcionário) | Controlar quem tem acesso ao sistema de cadastro | Não há hoje nenhum controle formal de quem acessa a planilha/drive (inferido do "o que você não quer que aconteça junto com isso": acesso indevido — não confirmado literalmente pelo demandante como frustração atual, ver Pergunta em aberto #4) |

## Enquadramentos alternativos do problema

> O coração da divergência. O mesmo conjunto de dores admite mais de uma
> leitura, e cada leitura leva a uma solução diferente. Mínimo de dois.

| # | Enquadramento | Se este for o problema, resolve para quem | O que ficaria sem resposta |
| --- | --- | --- | --- |
| A | O cadastro não é estruturado nem pesquisável — falta um registro único e padronizado de clientes | Usuário (funcionário operacional), que ganha busca rápida e dado consistente | Quem pode ver ou alterar qual dado — a estruturação por si só não resolve controle de acesso |
| B | O acesso ao dado de cliente não é controlado nem rastreável — falta gestão de quem entra e o que faz | Gestor / área de segurança e compliance, que ganha controle e trilha de acesso | A lentidão de busca do dia a dia — um sistema com controle de acesso rígido, mas sem boa busca, não resolve a dor #1 |

## Restrições de contexto

| Restrição | Origem | Como afeta as opções |
| --- | --- | --- |
| Prazo apertado ("tem que ficar pronto rápido") | `docs/intent/cadastro-clientes-intent.md` | Reduz o espaço para soluções que exigem integração/infraestrutura extensa |
| Classificação de risco alto (toca autenticação + dado pessoal) | `docs/intent/cadastro-clientes-classification.md` | Exige os gates completos do flow `feature` antes de liberar, mesmo sendo uma demo |
| Autenticação própria, sem RH-SSO corporativo | `docs/decisions/SDR-001-autenticacao-simplificada-sem-rhsso.md` | Login e controle de papéis (gestor/usuário) precisam ser modelados dentro do próprio sistema |
| Stack Node/Express como exceção à stack padrão (Java) | `docs/decisions/ADR-001-backend-node-para-demo-idsd.md` | Soluções que dependeriam de módulos corporativos Java (ex. libs internas Banestes) não se aplicam aqui |

## Sinais contraditórios

> O que diferentes fontes dizem de forma incompatível. Não resolva aqui —
> registrar a contradição é mais valioso do que escolher um lado cedo demais.

| Tema | Fonte A diz | Fonte B diz | Quem decide |
| --- | --- | --- | --- |
| Velocidade de entrega × rigor de controle de acesso | Intent, Limites: "tem que ficar pronto rápido" | Intent, Fora de escopo: "que acesso indevido vaze informações dos clientes" — risco alto confirmado em /classify | /shape |
| Quem tem login no sistema | Intent, Resultado esperado: só "gestor" e "usuários" são papéis citados | Intent, Interface: "sistema web para que **todos os funcionários** utilizem" | /shape |

## Perguntas em aberto

| # | Pergunta | Por que importa | Quem responde |
| --- | --- | --- | --- |
| 1 | Quais são os dados mínimos exigidos para abertura de conta corrente (campos, documentos)? | Define o formulário de cadastro de clientes | Thiago Cavalcante |
| 2 | O que o gestor pode fazer além de cadastrar usuários (editar, desativar, redefinir senha)? | Define o escopo de permissões do papel gestor | Thiago Cavalcante |
| 3 | Qual o volume esperado de gestores e usuários? Há mais de um gestor? | Afeta se é preciso modelar hierarquia entre gestores | Thiago Cavalcante |
| 4 | "Todos os funcionários" têm login, ou só quem efetivamente cadastra cliente/usuário (papéis gestor/usuário)? | Resolve a contradição acima sobre quem acessa o sistema | Thiago Cavalcante |

---

## Fora deste artefato — regras negativas

- **Escolher um enquadramento.** É a função do `/shape`. Um discovery que
  apresenta uma única leitura do problema não divergiu.
- **Requisito numerado, critério de aceite, cenário Gherkin** → `/prd`.
- **Solução, fluxo de operação, estado, contrato** → `/solution`.
- **Tela, componente, layout** → `/design`.
- **Tecnologia** → `/techspec`.
- **Métrica com alvo definido** → `/shape`. Aqui se registra a linha de base
  observada, não a meta.
- **Reescrever a intenção do demandante** → `/intent` é a fonte. Se o discovery
  contradiz a Intent, isso é um achado a levar ao `/shape`, não uma correção a
  fazer aqui.
- **Dado real de cliente** (IDSD 4.10.1).
