# Exploração de Solução — cadastro-clientes

> D2 divergente, universal — vale para fluxos com e sem tela.
> Responde *como se comporta*, sem nenhuma tecnologia.
> Sem gate próprio: alimenta o `/prd`, que fecha no GATE-SPEC.

- **Shape Brief:** `docs/shape/cadastro-clientes-brief.md`
- **Data:** 2026-10-22

> **Teste de fronteira com o `/techspec`:** se trocar a tecnologia torna a frase
> falsa, a frase é de techspec e não pertence aqui.
> Pertence: "a operação é idempotente e rejeita duplicata em 24h devolvendo o
> resultado anterior". Não pertence: amarrar essa regra a um mecanismo técnico
> concreto de armazenamento com tempo de expiração.

---

## Fluxos de operação

### Fluxo: Admin global cria usuário

- **Ator:** Admin global
- **Gatilho:** Admin global decide conceder acesso ao sistema a um funcionário
- **Resultado esperado:** O funcionário passa a conseguir autenticar-se com o CPF e a senha cadastrados

| # | Passo | Quem faz | O que precisa ser verdade antes |
| --- | --- | --- | --- |
| 1 | Informa o CPF do funcionário | Admin global | Admin global está autenticado |
| 2 | Define uma senha para o novo usuário | Admin global | CPF informado é válido |
| 3 | Confirma a criação do usuário | Sistema | CPF não pertence a um usuário já existente |

**Caminhos alternativos:**

| Condição | O que acontece |
| --- | --- |
| CPF já pertence a um usuário existente | Sistema recusa a criação e aponta o conflito |
| CPF em formato inválido | Sistema recusa e indica o campo |

### Fluxo: Login

- **Ator:** Usuário ou Admin global (mesmo mecanismo para os dois papéis)
- **Gatilho:** Pessoa com usuário já criado tenta acessar o sistema
- **Resultado esperado:** Pessoa autenticada acessa as funcionalidades do seu papel

| # | Passo | Quem faz | O que precisa ser verdade antes |
| --- | --- | --- | --- |
| 1 | Informa CPF e senha | Pessoa | Pessoa possui usuário criado pelo admin global |
| 2 | Confere a combinação informada | Sistema | CPF e senha foram informados |
| 3 | Inicia uma sessão autenticada no papel correspondente ao usuário | Sistema | Combinação confere |

**Caminhos alternativos:**

| Condição | O que acontece |
| --- | --- |
| Combinação incorreta (CPF existente, senha errada) | Sistema recusa o acesso |
| CPF sem usuário cadastrado | Sistema recusa o acesso com a mesma resposta do caso anterior — não revela se o CPF existe |

> **Adendo (2026-10-22, achado em `/techspec`):** o escopo original não previa encerramento
> manual de sessão, só expiração por inatividade. Devolvido ao `/prd` — o demandante confirmou
> que quer uma ação explícita de sair do sistema. Ver Fluxo "Logout" abaixo, registrado como
> emenda no PRD.

### Fluxo: Logout

- **Ator:** Usuário ou Admin global, com sessão autenticada
- **Gatilho:** Pessoa aciona a ação de sair do sistema
- **Resultado esperado:** Sessão é encerrada imediatamente; qualquer operação seguinte exige novo login

| # | Passo | Quem faz | O que precisa ser verdade antes |
| --- | --- | --- | --- |
| 1 | Aciona a ação de sair | Pessoa | Sessão está autenticada |
| 2 | Encerra a sessão | Sistema | Ação foi acionada |

**Caminhos alternativos:**

| Condição | O que acontece |
| --- | --- |
| Sessão já havia expirado por inatividade antes do acionamento | Sistema trata como sessão já encerrada — não é erro |

### Fluxo: Incluir cliente (Pessoa Física ou Jurídica)

- **Ator:** Usuário autenticado
- **Gatilho:** Usuário recebe dados de um cliente para abertura de conta
- **Resultado esperado:** Cliente passa a existir no cadastro, pesquisável por qualquer usuário autenticado

| # | Passo | Quem faz | O que precisa ser verdade antes |
| --- | --- | --- | --- |
| 1 | Escolhe o tipo de cliente — Pessoa Física ou Pessoa Jurídica | Usuário | Usuário está autenticado |
| 2 | Informa os dados mínimos do tipo escolhido | Usuário | Tipo foi escolhido |
| 3 | Para Pessoa Jurídica, informa um ou mais sócios (nome completo e CPF) | Usuário | Tipo escolhido é Pessoa Jurídica |
| 4 | Confirma a inclusão | Sistema | Todos os dados mínimos exigidos foram informados e são válidos |

**Caminhos alternativos:**

| Condição | O que acontece |
| --- | --- |
| Campo obrigatório vazio | Sistema recusa a inclusão e aponta o(s) campo(s) |
| CPF/CNPJ já pertence a outro cliente cadastrado | Ver Regras de borda #2 e Opções de comportamento #1 |
| Pessoa Jurídica sem nenhum sócio informado | Ver Regras de borda #5 |

### Fluxo: Editar cadastro de cliente

- **Ator:** Usuário autenticado
- **Gatilho:** Usuário precisa corrigir ou completar um dado de cliente já cadastrado
- **Resultado esperado:** O cadastro passa a refletir os dados atualizados

| # | Passo | Quem faz | O que precisa ser verdade antes |
| --- | --- | --- | --- |
| 1 | Localiza o cliente já cadastrado | Usuário | Cliente existe no cadastro ativo |
| 2 | Altera um ou mais campos | Usuário | Cliente foi localizado |
| 3 | Confirma a atualização | Sistema | Dados alterados continuam atendendo os mínimos exigidos |

**Caminhos alternativos:**

| Condição | O que acontece |
| --- | --- |
| Cliente foi excluído por outra sessão entre a localização e a confirmação | Ver Regras de borda #4 |
| Alteração deixaria um campo obrigatório vazio | Sistema recusa a atualização e mantém o dado anterior |

### Fluxo: Excluir cadastro de cliente

- **Ator:** Usuário autenticado
- **Gatilho:** Usuário precisa remover um cadastro (engano, desistência do cliente)
- **Resultado esperado:** Cliente deixa de aparecer no cadastro ativo

| # | Passo | Quem faz | O que precisa ser verdade antes |
| --- | --- | --- | --- |
| 1 | Localiza o cliente | Usuário | Cliente existe no cadastro ativo |
| 2 | Confirma a exclusão | Usuário | Cliente foi localizado |
| 3 | Remove o cliente do cadastro ativo | Sistema | Confirmação foi dada |

**Caminhos alternativos:**

| Condição | O que acontece |
| --- | --- |
| Cliente já havia sido excluído por outra sessão | Sistema informa que a operação não se aplica mais — não trata como erro técnico |

## Estados e transições

| Estado | Significado para o negócio | Transições que saem | Quem pode disparar |
| --- | --- | --- | --- |
| Cliente — inexistente | Nenhum cadastro feito para essa pessoa/empresa ainda | → Ativo (inclusão) | Usuário |
| Cliente — ativo | Cadastro existe, aparece nas buscas e pode ser editado | → Excluído (exclusão) | Usuário |
| Cliente — excluído | Cadastro não aparece mais no cadastro ativo | nenhuma (ver Transições proibidas) | — |
| Sessão — não autenticada | Ninguém operando com identidade conhecida | → Autenticada (login) | Usuário / Admin global |
| Sessão — autenticada | Pessoa identificada, agindo conforme seu papel | → Não autenticada (expiração ou logout) | Sistema (por expiração) ou a própria pessoa (por logout) |

- **Estado inicial:** Cliente inexistente; Sessão não autenticada.
- **Estados terminais:** Cliente excluído (não há reativação no escopo aprovado).
- **Transições proibidas:**
  - Editar ou excluir um cliente que está no estado Excluído.
  - Qualquer operação de criação de usuário ou de cadastro de cliente a partir de uma Sessão não autenticada.
  - Reativar um cliente Excluído de volta a Ativo (fora do escopo aprovado no Shape Brief).

## Semântica de contrato

> Comportamento observável de cada operação, independente de protocolo.

| Operação | Entrada (significado) | Saída (significado) | Idempotente | Efeito colateral |
| --- | --- | --- | --- | --- |
| Criar usuário | CPF do funcionário + senha definida pelo admin global | Confirmação de criação, ou motivo de recusa | Não — repetir com o mesmo CPF é recusado por duplicidade, não cria um segundo usuário | Novo usuário passa a poder autenticar-se |
| Autenticar (login) | CPF + senha | Sessão autenticada, ou recusa | Sim — repetir com as mesmas credenciais corretas produz o mesmo resultado | Início de uma sessão autenticada |
| Incluir cliente | Tipo (PF/PJ) + dados mínimos do tipo (e sócios, se PJ) | Confirmação da inclusão com identificador do cliente, ou motivo de recusa | Não — repetir os mesmos dados é um novo cadastro, sujeito à regra de duplicidade (Opção de comportamento #1) | Cliente passa a existir no cadastro ativo |
| Editar cliente | Identificador do cliente + campos alterados | Confirmação da atualização, ou motivo de recusa | Sim — aplicar a mesma alteração duas vezes resulta no mesmo estado final | Dado do cliente é sobrescrito |
| Excluir cliente | Identificador do cliente | Confirmação da remoção | Sim — excluir um cliente já excluído apenas confirma que ele não está mais ativo | Cliente deixa de aparecer no cadastro ativo |

## Regras de borda

| # | Situação | Comportamento esperado | Por que não é o óbvio |
| --- | --- | --- | --- |
| 1 | Campo obrigatório do cadastro de cliente vazio | Sistema recusa a inclusão/edição e aponta o campo | Aceitar parcialmente pareceria mais flexível, mas reabriria o mesmo problema dos "campos abertos" da planilha que esta entrega existe para resolver |
| 2 | CPF/CNPJ duplicado — cliente já cadastrado com o mesmo documento | Decidido no `/prd`: bloquear o cadastro (ver Opções de comportamento #1) | Bloquear parece óbvio, mas "permitir com aviso" também era defensável se o mesmo cliente tivesse mais de uma relação com o banco — por isso virou decisão do demandante no `/prd`, não default |
| 3 | Dois usuários editam o mesmo cliente ao mesmo tempo (concorrente) | A última confirmação prevalece; não há bloqueio nem aviso de conflito | Avisar conflito pareceria mais seguro, mas é mecanismo de controle de concorrência explicitamente fora do escopo aprovado (sem logs/auditoria nesta entrega) |
| 4 | Editar ou excluir um cliente que já foi excluído por outra sessão (fora de ordem) | Sistema informa que a operação não se aplica mais, distinto de "nunca existiu" | O default óbvio seria um "não encontrado" genérico, mas confundiria quem está vendo esse cliente na tela há poucos segundos |
| 5 | Pessoa Jurídica cadastrada sem nenhum sócio informado (parcial) | Sistema recusa a inclusão — sócio é dado mínimo de PJ, não opcional | Poderia parecer aceitável completar os sócios depois, mas o Shape Brief fixou sócios como parte dos dados mínimos de PJ |
| 6 | Sessão autenticada expira durante o preenchimento de um cadastro (expirado) | Dados digitados e não confirmados são perdidos; é exigida nova autenticação | Não existe conceito de rascunho no escopo aprovado — presumir que haveria é inventar comportamento |
| 7 | Usuário comum tenta criar ou visualizar a lista de usuários (sem permissão) | Sistema recusa a operação nos dois casos — criar e visualizar são exclusivos do admin global | Com só dois papéis pode parecer desnecessário checar, mas é exatamente a garantia que atende ao "não quero acesso indevido" da Intent; a visualização da lista de usuários foi esclarecida depois, em `/design` (2026-10-22), e herda a mesma restrição de permissão da criação |

> Cobrir no mínimo: vazio, duplicado, concorrente, fora de ordem, parcial,
> expirado, sem permissão. "Não se aplica" é resposta válida, mas explícita.

## Opções de comportamento consideradas

> Isto é a divergência de D2. Sem alternativas, não houve exploração.

| Questão em aberto | Opção A | Opção B | Recomendação | Decidir em |
| --- | --- | --- | --- | --- |
| CPF/CNPJ de cliente duplicado | Bloquear — um CPF/CNPJ só pode ter um cadastro ativo | Permitir múltiplos cadastros para o mesmo CPF/CNPJ, com aviso | A — evita reproduzir o problema de dado disperso que motivou esta entrega | /prd |
| Exigência de complexidade da senha do usuário | Sem exigência nesta entrega (qualquer senha não vazia) | Exigir tamanho mínimo e combinação de caracteres | B — a Intent cita explicitamente o risco de acesso indevido | /prd |
| Exclusão de cliente: definitiva ou reversível | Definitiva — cliente removido do cadastro ativo, sem recuperação pela aplicação | Reversível — cliente marcado como inativo, recuperável | A — coerente com a fronteira de escopo, que já exclui auditoria/histórico | /prd |
| Duração da sessão autenticada antes de expirar | Expira após um período curto de inatividade | Dura enquanto o navegador estiver aberto, sem expiração por tempo | A — prática mínima de segurança para um sistema que guarda dado pessoal | /prd (detalhamento técnico em /techspec) |

> **As quatro linhas acima registram a divergência tal como ela aconteceu nesta
> etapa — não são atualizadas depois.** As quatro foram decididas pelo
> demandante no `/prd` (todas pela Opção A/B recomendada: bloquear duplicado,
> senha mínimo 8 caracteres, exclusão definitiva, sessão expira em 5 minutos de
> inatividade); a decisão vigente está em `docs/prd/cadastro-clientes-prd.md`,
> não aqui.

## Entidades e vocabulário

> Nomes que o negócio usa. Vira insumo direto da dimensão E do canvas.

| Termo | Definição | Não confundir com |
| --- | --- | --- |
| Usuário | Pessoa com acesso ao sistema, criada pelo admin global, que cadastra clientes | Cliente — pessoa cadastrada para abertura de conta, que não acessa o sistema |
| Admin global | Papel único responsável por criar usuários | Usuário comum — não cria outros usuários |
| Cliente | Pessoa física ou jurídica cadastrada para abertura de conta corrente | Usuário — quem opera o sistema |
| Cadastro | Registro de um cliente no sistema, com os dados mínimos definidos no Shape Brief | Formulário — a interface de preenchimento, assunto de `/design` |
| Sócio | Pessoa física vinculada a um cliente Pessoa Jurídica, com nome completo e CPF | Cliente — um sócio não é, por si só, um cliente cadastrado |

---

## Fora deste artefato — regras negativas

- **Qualquer tecnologia**: banco, fila, framework, biblioteca, protocolo,
  formato de serialização, nome de serviço → `/techspec`.
- **Requisito numerado ou critério de aceite** → `/prd`. Aqui há comportamento
  descrito, não requisito verificável.
- **Cenário Gherkin** → `/prd`. É lá que o cenário ganha ID e vira contrato.
- **Tela, layout, componente visual** → `/design`. Aqui o fluxo é agnóstico de
  interface; se só faz sentido com tela, está no artefato errado.
- **Escolha de direção de negócio** → `/shape`. Se a exploração revelar que a
  direção está errada, devolva ao `/shape`; não decida aqui.
- **Modelagem de dados, tabela, campo, tipo** → `/techspec`. Entidade aqui é
  vocabulário de negócio, não esquema.
- **Estimativa, task, sequenciamento de entrega** → `/tasks`.
