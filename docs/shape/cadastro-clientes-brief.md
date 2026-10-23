# Shape Brief — cadastro-clientes

> D1 convergente. Produz **decisão, não especificação**.
> Responde *o quê* e *até onde* — nunca *como se comporta* nem *com o quê*.
> **Gate:** GATE-DIRECAO (aprovação humana obrigatória)

- **Intent:** `docs/intent/cadastro-clientes-intent.md`
- **Discovery:** `docs/discovery/cadastro-clientes-discovery.md`
- **Data:** 2026-10-22
- **Modo:** entrevista
- **Artefato externo ingerido:** —

---

## Problema escolhido

Os dois enquadramentos do discovery foram adotados juntos, por decisão
explícita do demandante ("Ambos"): o cadastro de clientes não é estruturado
nem pesquisável (Enquadramento A) **e** o acesso a esse dado não é controlado
(Enquadramento B). As duas dores nascem do mesmo processo informal (planilha +
drive) e, nesta demanda, são tratadas pela mesma entrega: um sistema com login
(controle de quem acessa) e cadastro estruturado de clientes (campos fixos,
não livres).

## Direção escolhida

Construir um sistema web com dois papéis — **admin global**, que cria contas
de usuário (CPF + senha), e **usuário**, que faz login e mantém o cadastro de
clientes (incluir, editar, excluir) com campos fixos para Pessoa Física e
Pessoa Jurídica. A entrega é uma demonstração do flow IDSD ponta a ponta, não
um sistema de produção: autenticação simplificada (sem RH-SSO,
[SDR-001](../decisions/SDR-001-autenticacao-simplificada-sem-rhsso.md)) e
stack Node/Express por exceção
([ADR-001](../decisions/ADR-001-backend-node-para-demo-idsd.md)). A aposta é
validada por uma suíte e2e (Playwright, modo visual) e por aprovação do
demandante em homologação — não por uma métrica de negócio quantificada nesta
rodada.

## Alternativas descartadas

| Alternativa | Por que foi considerada | Por que foi descartada | Reabrir se |
| --- | --- | --- | --- |
| Resolver só o Enquadramento A (estruturar o cadastro, sem login/controle de acesso) | Ataca a dor diária de busca lenta sem o custo de modelar autenticação | O próprio demandante colocou "acesso indevido" como o que não quer que aconteça — sem controle de acesso essa restrição fica sem resposta | Nunca nesta demanda — login é parte fixa do escopo |
| Resolver só o Enquadramento B, com controle de acesso rígido, auditoria e hierarquia de gestores | Ataca diretamente o risco de vazamento | Auditoria e hierarquia foram explicitamente colocadas fora de escopo pelo demandante; sozinho não resolve a demora de busca (dor #1) | Quando o sistema deixar de ser demo e for avaliado para produção real |
| Autenticação via RH-SSO corporativo | É o padrão do workspace para identidade | Decisão já registrada em [SDR-001](../decisions/SDR-001-autenticacao-simplificada-sem-rhsso.md) — overhead desnecessário para uma demo | Se o sistema sair de demo e for proposto para produção |
| Backend na stack padrão do workspace (Java + Spring Boot) | É a stack obrigatória para todo serviço novo | Decisão já registrada em [ADR-001](../decisions/ADR-001-backend-node-para-demo-idsd.md) — Node reduz fricção de setup para o propósito de demonstração | Se o sistema sair de demo e for proposto para produção |

## Fronteira de escopo

| Dentro | Fora | Adiado para depois |
| --- | --- | --- |
| Login com CPF + senha | Recuperação de senha / "esqueci minha senha" | Retomar quando o sistema sair de demo |
| Admin global cria usuário (CPF + senha); admin global visualiza lista somente leitura dos usuários já criados (esclarecido em `/design`, 2026-10-22) | Admin global editar, desativar usuários | Retomar quando houver necessidade operacional real de trocar senha ou remover acesso de funcionário |
| Usuário faz login e mantém clientes: incluir, editar, excluir | Hierarquia entre gestores/admins | Retomar se existir mais de um admin global com necessidade de permissões diferentes |
| Cadastro de cliente PF (nome completo, CPF, data de nascimento, endereço, telefone) | Logs e auditoria de acesso | Retomar quando o sistema sair de demo ou houver exigência de compliance |
| Cadastro de cliente PJ (nome fantasia, razão social, CNPJ, data de abertura, endereço, telefone, sócios — nome completo e CPF por sócio) | Integração com sistema real de abertura de conta corrente | Retomar quando o sistema sair de demo |
| Suíte e2e visual (Playwright, modo headed) cobrindo login e CRUD de clientes | — | — |

> "Adiado" exige gatilho: o que precisa acontecer para voltar à mesa.

## Personas e jornadas priorizadas

| Persona | Jornada | Prioridade | Por que esta primeiro |
| --- | --- | --- | --- |
| Admin global | Criar usuário (CPF + senha) | 1 | Sem usuário criado, ninguém mais consegue entrar no sistema — é pré-requisito de toda jornada seguinte |
| Usuário | Login e CRUD de cliente (PF/PJ) | 2 | É a jornada que ataca a dor diária relatada (demora para achar/gerir dado de cliente) |

## Restrições de negócio

| Restrição | Origem | Rígida ou negociável |
| --- | --- | --- |
| Entrega rápida ("tem que ficar pronto rápido") | `docs/intent/cadastro-clientes-intent.md` | Rígida |
| Nenhum acesso indevido ao dado de cliente — login obrigatório para qualquer operação de cadastro | `docs/intent/cadastro-clientes-intent.md` | Rígida |
| Campos fixos de PF e PJ definidos nesta etapa (ver Fronteira de escopo) | Decisão desta sessão de /shape | Negociável só com nova rodada de decisão — não por inferência de etapa posterior |

## Métrica de sucesso

> Como saberemos, depois de entregue, se a aposta estava certa.

| Métrica | Linha de base hoje | Alvo | Prazo de leitura | Instrumentação existe |
| --- | --- | --- | --- | --- |
| Suíte e2e (Playwright, modo visual) cobrindo login e CRUD de clientes | Não aplicável — sistema não existe | 100% dos cenários congelados passando, em modo visual (não apenas headless) | Ao final da implementação, antes da homologação | Não — criada em `/tests` |
| Aprovação do demandante em homologação | Não aplicável | Aprovação explícita do demandante | Após suíte e2e verde | Não — é um ato humano, não instrumentação |
| Tempo para localizar dados de um cliente (dor original #1 do discovery) | Não medido — só relato qualitativo ("diário", "perdendo oportunidades") | **Não definido nesta entrega** | — | Não — sem instrumentação hoje; registrado como lacuna, não como meta inventada |

## Hipóteses a validar

> Obrigatório em modo ingestão. Saída de workshop é hipótese, não requisito.

_Não aplicável — modo entrevista, não ingestão._

## Restrições técnicas herdadas

> Só em modo ingestão, quando o ritual externo teve participação técnica.

_Não aplicável — modo entrevista, não ingestão._

---

## Aprovação — gate de direção

- **Aprovado por:** Thiago Cavalcante (Coordenador)
- **Data:** 2026-10-22
- **Ressalvas:** nenhuma

---

## Fora deste artefato — regras negativas

- **Requisito numerado (RF-nn, RNF-nn, RN-nn).** Zero. Se aparecer numeração de
  requisito, o brief virou PRD prematuro → `/prd`.
- **Critério de aceite ou cenário Gherkin** → `/prd`.
- **Fluxo passo a passo, máquina de estados, semântica de contrato** →
  `/solution`. Aqui se decide *que* jornada é prioritária, não *como* ela corre.
- **Tela, wireframe, componente** → `/design`.
- **Tecnologia, biblioteca, banco, protocolo** → `/techspec`.
- **Task, épico, estimativa** → `/tasks`.
- **Levantamento aberto sem conclusão.** Se a seção "Direção escolhida" tem mais
  de uma direção, a convergência não aconteceu — o brief não passa no gate.
