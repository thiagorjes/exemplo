# PRD — cadastro-clientes

> D2 convergente. Fecha o escopo da entrega e registra **o que precisa ser
> verdade**. É aqui que o comportamento explorado vira requisito verificável.
> **Gates:** GATE-SPEC (aprovação humana), GATE-PROVENIENCIA

- **Shape Brief:** `docs/shape/cadastro-clientes-brief.md`
- **Solução:** `docs/solution/cadastro-clientes-solution.md`
- **Design:** `docs/design/cadastro-clientes/screen-map.md`
- **Data:** 2026-10-22
- **Versão:** 1.0

---

## Escopo da entrega

| Dentro | Fora | Por que fora |
| --- | --- | --- |
| Login com CPF + senha | Recuperação de senha / "esqueci minha senha" | Fora do escopo aprovado no Shape Brief — retomar quando o sistema sair de demo |
| Admin global cria usuário (CPF + senha) | Admin global editar, desativar usuários | Fora do escopo aprovado no Shape Brief — retomar quando houver necessidade operacional real |
| Admin global visualiza lista de usuários já criados, somente leitura (ver nota de divergência abaixo) | Hierarquia entre gestores/admins | Fora do escopo aprovado no Shape Brief — retomar se existir mais de um admin global com necessidade de permissões diferentes |
| Usuário faz login e mantém clientes: incluir, editar, excluir (PF e PJ) | Logs e auditoria de acesso | Fora do escopo aprovado no Shape Brief — retomar quando o sistema sair de demo ou houver exigência de compliance |
| Cadastro de cliente PF (nome completo, CPF, data de nascimento, endereço, telefone) | Integração com sistema real de abertura de conta corrente | Fora do escopo aprovado no Shape Brief — retomar quando o sistema sair de demo |
| Cadastro de cliente PJ (nome fantasia, razão social, CNPJ, data de abertura, endereço, telefone, sócios) | — | — |
| Cenários e2e que alimentam a suíte Playwright visual (execução em `/tests`) | — | — |

> **Divergência registrada em relação ao Shape Brief:** o Shape Brief
> (`docs/shape/cadastro-clientes-brief.md`, Fronteira de escopo) listava
> "Admin global editar, desativar **ou listar** usuários" inteiramente como
> fora de escopo. Durante a etapa `/design` (2026-10-22), o demandante (Thiago
> Cavalcante) pediu explicitamente que a tela de gestão de usuários mostre,
> somente leitura, os usuários já cadastrados, "para conferência" — sem alterar
> o restante da fronteira (edição e desativação de usuário continuam fora).
> Este PRD registra essa ampliação pontual como RF-003, confirmada pelo
> demandante, e não como inferência silenciosa.

## Regras de negócio

| ID | Regra | Procedência | Fonte |
| --- | --- | --- | --- |
| RN-001 | Usuário só pode ser criado pelo admin global — não há autocadastro | informada | `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo) |
| RN-002 | CPF já usado por um usuário existente bloqueia a criação de um novo usuário com o mesmo CPF | derivada | `docs/solution/cadastro-clientes-solution.md` (Fluxo "Admin global cria usuário", caminho alternativo) |
| RN-003 | Senha do usuário deve ter no mínimo 8 caracteres, sem exigência de composição | informada | demandante, captura em `/prd` em 2026-10-22 |
| RN-004 | Sessão autenticada expira após 5 minutos de inatividade | informada | demandante, captura em `/prd` em 2026-10-22 |
| RN-005 | Toda operação sobre cadastro de cliente (incluir, editar, excluir, listar) exige sessão autenticada | derivada | `docs/solution/cadastro-clientes-solution.md` (Transições proibidas) |
| RN-006 | Criação e visualização de usuários é exclusiva do papel admin global; usuário comum não pode executá-las | derivada | `docs/solution/cadastro-clientes-solution.md` (Regra de borda #7 — sem permissão) |
| RN-007 | CPF (Pessoa Física) ou CNPJ (Pessoa Jurídica) de cliente já cadastrado bloqueia um novo cadastro com o mesmo documento | informada | demandante, captura em `/prd` em 2026-10-22 |
| RN-008 | Cliente Pessoa Jurídica exige ao menos um sócio (nome completo + CPF) | informada | `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo) |
| RN-009 | Exclusão de cliente é definitiva — não há reativação pela aplicação | informada | demandante, captura em `/prd` em 2026-10-22 |
| RN-010 | Cadastro de cliente Pessoa Física exige: nome completo, CPF, data de nascimento, endereço, telefone | informada | `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo) |
| RN-011 | Cadastro de cliente Pessoa Jurídica exige: nome fantasia, razão social, CNPJ, data de abertura, endereço, telefone, e ao menos um sócio (nome completo + CPF) por sócio | informada | `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo) |

## Requisitos funcionais

### RF-001 — Login

- **Descrição:** Permitir que uma pessoa com usuário já criado autentique-se informando CPF e senha, iniciando uma sessão no papel correspondente (admin global ou usuário).
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** `docs/shape/cadastro-clientes-brief.md` (Direção escolhida; Fronteira de escopo)
- **Regras aplicáveis:** RN-004
- **Origem no protótipo:** T1 Login — estados idle, loading, erro

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-001.1 | Login bem-sucedido | e2e |
| SCN-001.2 | Credencial inválida não revela se o CPF existe | e2e |
| SCN-001.3 | Sessão expira após 5 minutos de inatividade | e2e |

```gherkin
Cenário: SCN-001.1 — Login bem-sucedido
  Dado que a pessoa possui um usuário criado por um admin global
  Quando ela informa o CPF e a senha corretos
  Então o sistema inicia uma sessão autenticada no papel correspondente ao usuário
```

```gherkin
Cenário: SCN-001.2 — Credencial inválida não revela se o CPF existe
  Dado que uma pessoa informa um CPF sem usuário cadastrado ou uma senha incorreta para um CPF existente
  Quando ela tenta entrar no sistema
  Então o sistema recusa o acesso com a mesma mensagem genérica nos dois casos
```

```gherkin
Cenário: SCN-001.3 — Sessão expira após 5 minutos de inatividade
  Dado que uma sessão autenticada ficou 5 minutos sem nenhuma ação
  Quando a pessoa tenta realizar uma nova operação
  Então o sistema exige que ela se autentique novamente
```

### RF-002 — Admin global cria usuário

- **Descrição:** Permitir que o admin global crie um novo usuário informando CPF e senha, para que essa pessoa passe a conseguir autenticar-se no sistema.
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo; Personas e jornadas priorizadas)
- **Regras aplicáveis:** RN-001, RN-002, RN-003, RN-006
- **Origem no protótipo:** T2 Gestão de usuários — estados idle, preenchido, erro, sucesso

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-002.1 | Criação de usuário bem-sucedida | e2e |
| SCN-002.2 | CPF já cadastrado para outro usuário | e2e |
| SCN-002.3 | Usuário comum não pode criar usuário | e2e |

```gherkin
Cenário: SCN-002.1 — Criação de usuário bem-sucedida
  Dado que o admin global está autenticado
  Quando ele informa um CPF válido ainda não cadastrado e uma senha com 8 ou mais caracteres
  Então o sistema cria o usuário e ele passa a constar na lista de usuários
```

```gherkin
Cenário: SCN-002.2 — CPF já cadastrado para outro usuário
  Dado que já existe um usuário cadastrado com um determinado CPF
  Quando o admin global tenta criar outro usuário com o mesmo CPF
  Então o sistema recusa a criação e aponta o conflito
```

```gherkin
Cenário: SCN-002.3 — Usuário comum não pode criar usuário
  Dado que uma pessoa autenticada no papel usuário tenta acessar a criação de usuário
  Quando ela tenta executar essa ação
  Então o sistema recusa a operação
```

### RF-003 — Admin global visualiza lista de usuários cadastrados, somente leitura

- **Descrição:** Permitir que o admin global veja, sem poder editar ou excluir, a lista de usuários já criados — para conferência de quem tem acesso ao sistema.
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** demandante, pedido feito na etapa `/design` em 2026-10-22 (ver nota de divergência em "Escopo da entrega")
- **Regras aplicáveis:** RN-006
- **Origem no protótipo:** T2 Gestão de usuários — estados idle, vazio

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-003.1 | Lista de usuários exibida para o admin global | e2e |
| SCN-003.2 | Nenhum usuário além do próprio admin global criado ainda | e2e |
| SCN-003.3 | Usuário comum não pode acessar a lista de usuários | e2e |

```gherkin
Cenário: SCN-003.1 — Lista de usuários exibida para o admin global
  Dado que existem usuários já criados
  Quando o admin global acessa a tela de gestão de usuários
  Então ele vê a lista com todos os usuários cadastrados, sem ações de editar ou excluir
```

```gherkin
Cenário: SCN-003.2 — Nenhum usuário além do próprio admin global criado ainda
  Dado que nenhum outro usuário foi criado
  Quando o admin global acessa a tela de gestão de usuários
  Então o sistema indica que não há usuários cadastrados além dele
```

```gherkin
Cenário: SCN-003.3 — Usuário comum não pode acessar a lista de usuários
  Dado que uma pessoa autenticada no papel usuário tenta acessar a tela de gestão de usuários
  Quando ela tenta abri-la
  Então o sistema recusa o acesso
```

### RF-004 — Usuário inclui cliente Pessoa Física

- **Descrição:** Permitir que o usuário cadastre um cliente Pessoa Física com os dados mínimos exigidos para abertura de conta corrente.
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo); `docs/discovery/cadastro-clientes-discovery.md` (campos PF confirmados pelo demandante)
- **Regras aplicáveis:** RN-005, RN-007, RN-010
- **Origem no protótipo:** T4 Incluir/editar cliente — estados idle, preenchido, erro, sucesso

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-004.1 | Inclusão de cliente Pessoa Física bem-sucedida | e2e |
| SCN-004.2 | CPF já cadastrado para outro cliente | e2e |
| SCN-004.3 | Campo obrigatório vazio | e2e |

```gherkin
Cenário: SCN-004.1 — Inclusão de cliente Pessoa Física bem-sucedida
  Dado que o usuário está autenticado
  Quando ele informa nome completo, CPF, data de nascimento, endereço e telefone de uma pessoa física ainda não cadastrada
  Então o sistema inclui o cliente e ele passa a aparecer na lista de clientes
```

```gherkin
Cenário: SCN-004.2 — CPF já cadastrado para outro cliente
  Dado que já existe um cliente cadastrado com um determinado CPF
  Quando o usuário tenta incluir outro cliente Pessoa Física com o mesmo CPF
  Então o sistema recusa a inclusão
```

```gherkin
Cenário: SCN-004.3 — Campo obrigatório vazio
  Dado que o usuário deixa em branco um dos campos obrigatórios do cadastro de Pessoa Física
  Quando ele tenta confirmar a inclusão
  Então o sistema recusa a inclusão e aponta o campo pendente
```

### RF-005 — Usuário inclui cliente Pessoa Jurídica, com sócios

- **Descrição:** Permitir que o usuário cadastre um cliente Pessoa Jurídica com os dados mínimos exigidos para abertura de conta corrente, incluindo ao menos um sócio.
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo); `docs/discovery/cadastro-clientes-discovery.md` (campos PJ confirmados pelo demandante)
- **Regras aplicáveis:** RN-005, RN-007, RN-008, RN-011
- **Origem no protótipo:** T4 Incluir/editar cliente — estados idle, preenchido, erro, sucesso, vazio (lista de sócios)

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-005.1 | Inclusão de cliente Pessoa Jurídica bem-sucedida | e2e |
| SCN-005.2 | CNPJ já cadastrado para outro cliente | e2e |
| SCN-005.3 | Pessoa Jurídica sem nenhum sócio informado | e2e |

```gherkin
Cenário: SCN-005.1 — Inclusão de cliente Pessoa Jurídica bem-sucedida
  Dado que o usuário está autenticado
  Quando ele informa nome fantasia, razão social, CNPJ, data de abertura, endereço, telefone e ao menos um sócio com nome completo e CPF
  Então o sistema inclui o cliente Pessoa Jurídica e ele passa a aparecer na lista de clientes
```

```gherkin
Cenário: SCN-005.2 — CNPJ já cadastrado para outro cliente
  Dado que já existe um cliente cadastrado com um determinado CNPJ
  Quando o usuário tenta incluir outro cliente Pessoa Jurídica com o mesmo CNPJ
  Então o sistema recusa a inclusão
```

```gherkin
Cenário: SCN-005.3 — Pessoa Jurídica sem nenhum sócio informado
  Dado que o usuário preenche os dados da empresa sem informar nenhum sócio
  Quando ele tenta confirmar a inclusão
  Então o sistema recusa a inclusão por faltar ao menos um sócio
```

### RF-006 — Usuário edita cadastro de cliente

- **Descrição:** Permitir que o usuário corrija ou complete os dados de um cliente (Pessoa Física ou Jurídica) já cadastrado.
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo — "usuário... mantém clientes: incluir, editar, excluir")
- **Regras aplicáveis:** RN-005
- **Origem no protótipo:** T4 Incluir/editar cliente (modo editar) — estados idle, preenchido, erro, sucesso

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-006.1 | Edição de cliente bem-sucedida | e2e |
| SCN-006.2 | Edição deixaria campo obrigatório vazio | e2e |
| SCN-006.3 | Duas edições concorrentes no mesmo cliente | integração |

```gherkin
Cenário: SCN-006.1 — Edição de cliente bem-sucedida
  Dado que um cliente já está cadastrado
  Quando o usuário altera um ou mais dos seus campos e confirma
  Então o cadastro passa a refletir os dados atualizados
```

```gherkin
Cenário: SCN-006.2 — Edição deixaria campo obrigatório vazio
  Dado que a alteração proposta deixaria um campo obrigatório em branco
  Quando o usuário tenta confirmar a atualização
  Então o sistema recusa a atualização e mantém o dado anterior
```

```gherkin
Cenário: SCN-006.3 — Duas edições concorrentes no mesmo cliente
  Dado que dois usuários editam o mesmo cliente ao mesmo tempo
  Quando as duas confirmações chegam ao sistema
  Então a última confirmação prevalece, sem bloqueio nem aviso de conflito
```

### RF-007 — Usuário exclui cadastro de cliente

- **Descrição:** Permitir que o usuário remova definitivamente o cadastro de um cliente.
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo — "usuário... mantém clientes: incluir, editar, excluir")
- **Regras aplicáveis:** RN-005, RN-009
- **Origem no protótipo:** T5 Confirmar exclusão (overlay de T3) — estados idle, erro

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-007.1 | Exclusão de cliente bem-sucedida | e2e |
| SCN-007.2 | Cliente já excluído por outra sessão | e2e |
| SCN-007.3 | Exclusão é definitiva | e2e |

```gherkin
Cenário: SCN-007.1 — Exclusão de cliente bem-sucedida
  Dado que um cliente está cadastrado
  Quando o usuário confirma a exclusão
  Então o cliente deixa de aparecer na lista de clientes ativa
```

```gherkin
Cenário: SCN-007.2 — Cliente já excluído por outra sessão
  Dado que o cliente já havia sido excluído por outra sessão
  Quando o usuário tenta excluí-lo novamente
  Então o sistema informa que a operação não se aplica mais, sem tratar como erro técnico
```

```gherkin
Cenário: SCN-007.3 — Exclusão é definitiva
  Dado que um cliente foi excluído
  Quando o usuário procura por esse cliente na lista de clientes ativa
  Então o sistema não oferece nenhuma forma de reativação — o cliente não aparece mais
```

### RF-008 — Usuário busca/lista clientes cadastrados

- **Descrição:** Permitir que o usuário veja e localize os clientes já cadastrados, como ponto de entrada para incluir, editar ou excluir um cadastro.
- **Prioridade:** deve
- **Procedência:** derivada
- **Fonte:** `docs/solution/cadastro-clientes-solution.md` (semântica de contrato — "cliente passa a existir no cadastro, pesquisável"); `docs/discovery/cadastro-clientes-discovery.md` (dor #1 — demora para achar cliente)
- **Regras aplicáveis:** RN-005
- **Origem no protótipo:** T3 Lista de clientes — estados idle, loading, erro, vazio

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-008.1 | Lista de clientes exibida | e2e |
| SCN-008.2 | Nenhum cliente cadastrado ainda | e2e |
| SCN-008.3 | Acesso sem sessão autenticada | e2e |

```gherkin
Cenário: SCN-008.1 — Lista de clientes exibida
  Dado que existem clientes cadastrados
  Quando o usuário acessa a lista de clientes
  Então ele vê todos os clientes cadastrados
```

```gherkin
Cenário: SCN-008.2 — Nenhum cliente cadastrado ainda
  Dado que nenhum cliente foi cadastrado ainda
  Quando o usuário acessa a lista de clientes
  Então o sistema indica que não há clientes cadastrados
```

```gherkin
Cenário: SCN-008.3 — Acesso sem sessão autenticada
  Dado que não há uma sessão autenticada
  Quando alguém tenta acessar a lista de clientes diretamente
  Então o sistema recusa o acesso e exige login
```

### RF-009 — Logout

> **Emenda pós-gate (2026-10-22):** requisito não previsto na aprovação original do GATE-SPEC.
> Achado em `/techspec` (escopo original só previa expiração automática de sessão, sem ação
> manual de saída) e devolvido ao `/prd` — o demandante confirmou que quer a ação explícita.
> Ver `docs/solution/cadastro-clientes-solution.md`, Fluxo "Logout", e a tabela de Emendas ao
> final deste documento.

- **Descrição:** Permitir que a pessoa autenticada (usuário ou admin global) encerre a sessão explicitamente, sem esperar a expiração por inatividade.
- **Prioridade:** deve
- **Procedência:** informada
- **Fonte:** Thiago Cavalcante (demandante), captura em `/techspec` em 2026-10-22
- **Regras aplicáveis:** RN-004, RN-005
- **Origem no protótipo:** nenhuma — ação simples de navegação (navbar), não exige tela dedicada; protótipos existentes (T1–T5) não foram atualizados com o elemento, registrado como pendência de atualização visual não bloqueante (ver Dúvidas materiais em aberto)

#### Critérios de aceite

| ID | Cenário | Tipo de teste |
| --- | --- | --- |
| SCN-009.1 | Logout encerra a sessão | e2e |
| SCN-009.2 | Logout com sessão já expirada por inatividade | e2e |
| SCN-009.3 | Logout acionado duas vezes em sequência | integração |

```gherkin
Cenário: SCN-009.1 — Logout encerra a sessão
  Dado que a pessoa está autenticada
  Quando ela aciona a ação de sair
  Então a sessão é encerrada e qualquer operação seguinte exige novo login
```

```gherkin
Cenário: SCN-009.2 — Logout com sessão já expirada por inatividade
  Dado que a sessão da pessoa já expirou por inatividade
  Quando ela aciona a ação de sair
  Então o sistema trata a sessão como já encerrada, sem erro
```

```gherkin
Cenário: SCN-009.3 — Logout acionado duas vezes em sequência
  Dado que a pessoa aciona a ação de sair
  Quando a mesma ação é acionada uma segunda vez antes da primeira resposta
  Então a segunda chamada também encerra como sessão já encerrada, sem erro
```

## Requisitos não-funcionais

| ID | Requisito | Envelope | Condição de medição | Procedência |
| --- | --- | --- | --- | --- |
| RNF-001 | Tempo de resposta das operações de cadastro de cliente | p95 abaixo de 1 segundo, em ambiente de demonstração (até ~50 clientes cadastrados, poucos usuários simultâneos) | Observação durante a execução da suíte e2e — tempo entre a ação e a confirmação visível na tela | inferida pelo agente |
| RNF-002 | Disponibilidade do sistema | Sem meta de SLA nesta entrega — ambiente de demonstração/homologação, não produção contínua | Não aplicável — decisão explícita de não medir nesta entrega | inferida pelo agente |
| RNF-003 | Retenção de dado de cliente | Sem política de expurgo nesta entrega | Não aplicável — fora do escopo aprovado (sem logs/auditoria) | inferida pelo agente |
| RNF-004 | Volume suportado | 1 admin global e até dezenas de usuários, sem meta de escala além disso | Não medido — ambiente de demonstração | inferida pelo agente |

> **Envelope** é o limite verificável (ex: p95 < 300 ms). RNF sem envelope e sem
> condição de medição não é verificável e reprova o GATE-NFR mais adiante.

## Procedência — resumo

| Tipo | Quantidade | IDs |
| --- | --- | --- |
| informada | 16 | RN-001, RN-003, RN-004, RN-007, RN-008, RN-009, RN-010, RN-011, RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007, RF-009 |
| derivada | 4 | RN-002, RN-005, RN-006, RF-008 |
| extraída de legado | 0 | — |
| hipótese a validar | 0 | — |
| inferida pelo agente | 4 | RNF-001, RNF-002, RNF-003, RNF-004 |

> **Toda** regra e requisito tem exatamente um tipo de procedência.
> `hipótese a validar` exige experimento e critério de descarte na tabela abaixo.
> `inferida pelo agente` é permitida, mas cada ocorrência precisa ser confirmada
> por humano antes do gate — é o tipo que a auditoria vai olhar primeiro.

### Hipóteses a validar

| ID | Experimento | Critério de descarte | Prazo |
| --- | --- | --- | --- |

> Não aplicável nesta entrega — modo entrevista, não ingestão. Nenhuma hipótese de workshop a registrar.

### Inferências do agente pendentes de confirmação

| ID | O que foi inferido | Por que não havia fonte | Confirmado por |
| --- | --- | --- | --- |
| RNF-001 | p95 < 1s para operações de cadastro, em ambiente de demonstração (~50 clientes, poucos usuários simultâneos) | O demandante não definiu meta de desempenho; é referência mínima proposta para uma demo | Thiago Cavalcante |
| RNF-002 | Sem meta de disponibilidade/SLA nesta entrega | O demandante não definiu SLA; o sistema não é produção contínua | Thiago Cavalcante |
| RNF-003 | Sem política de retenção/expurgo de dado de cliente nesta entrega | Fora do escopo aprovado no Shape Brief (sem logs/auditoria); não há decisão do demandante sobre retenção | Thiago Cavalcante |
| RNF-004 | Volume de referência: 1 admin global + dezenas de usuários, sem meta de escala adicional | O demandante não quantificou o volume esperado (lacuna registrada desde `/context`, nunca fechada) | Thiago Cavalcante |

## Dúvidas materiais em aberto

> Dúvida material bloqueia o GATE-SPEC. Registrada por `/clarify`.

| # | Dúvida | Afeta | Quem responde | Status |
| --- | --- | --- | --- | --- |

> Nenhuma dúvida material bloqueante em aberto nesta entrega. O único ponto
> pendente do Design Brief (layout da lista de sócios em linha vs. cartão) já
> foi resolvido na prototipagem (Opção A — linha) e não afeta nenhum RF/RN
> deste PRD. Pendência não bloqueante registrada: os protótipos de T1–T5 não
> foram atualizados com o elemento de logout do RF-009 (emenda posterior à
> prototipagem) — não impede o gate, mas deve ser resolvido visualmente antes
> do `/implement` fechar a navbar autenticada.

## Rastreabilidade de origem

| RF/RNF | Veio de | Referência |
| --- | --- | --- |
| RF-001 | Shape Brief | `docs/shape/cadastro-clientes-brief.md` (Direção escolhida; Fronteira de escopo) |
| RF-002 | Shape Brief | `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo; Personas e jornadas priorizadas) |
| RF-003 | Demandante, em `/design` | Conversa de `/design`, 2026-10-22 |
| RF-004 | Shape Brief + Discovery | `docs/shape/cadastro-clientes-brief.md`; `docs/discovery/cadastro-clientes-discovery.md` |
| RF-005 | Shape Brief + Discovery | `docs/shape/cadastro-clientes-brief.md`; `docs/discovery/cadastro-clientes-discovery.md` |
| RF-006 | Shape Brief | `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo) |
| RF-007 | Shape Brief | `docs/shape/cadastro-clientes-brief.md` (Fronteira de escopo) |
| RF-008 | Solution + Discovery | `docs/solution/cadastro-clientes-solution.md`; `docs/discovery/cadastro-clientes-discovery.md` (dor #1) |
| RF-009 | Demandante, em `/techspec` (emenda pós-gate) | `docs/solution/cadastro-clientes-solution.md` (Fluxo Logout, adendo 2026-10-22); conversa de `/techspec`, 2026-10-22 |
| RNF-001 | Inferência do agente, em `/prd` | Este PRD, seção Procedência |
| RNF-002 | Inferência do agente, em `/prd` | Este PRD, seção Procedência |
| RNF-003 | Inferência do agente, em `/prd` | Este PRD, seção Procedência |
| RNF-004 | Inferência do agente, em `/prd` | Este PRD, seção Procedência |

---

## Aprovação — gate de spec

- **Aprovado por:** Thiago Cavalcante (Coordenador)
- **Data:** 2026-10-22
- **Ressalvas:** nenhuma
- **Cenários congelados a partir desta aprovação:** sim

> A partir daqui os cenários são contrato. Alteração exige emenda registrada —
> mexer num `.feature` aprovado sem emenda reprova o GATE-GHERKIN-CONGELADO.

## Emendas de cenário

| Data | Cenário | O que mudou | Motivo | Aprovado por |
| --- | --- | --- | --- | --- |
| 2026-10-22 | RF-009 (SCN-009.1, SCN-009.2, SCN-009.3) — novo, não é alteração de cenário existente | Escopo ganhou ação explícita de logout, ausente na aprovação original do GATE-SPEC; achado em `/techspec` | Escopo original só previa expiração automática de sessão (RN-004); demandante pediu ação manual de sair ao revisar a decisão de técnica de sessão | Thiago Cavalcante |

---

## Fora deste artefato — regras negativas

- **Tecnologia, biblioteca, banco, protocolo, esquema** → `/techspec`.
  O PRD diz o que precisa ser verdade; o techspec diz com o quê.
- **Decisão de direção de negócio** → `/shape`. Se o PRD precisa decidir
  direção, o gate de direção falhou — devolva.
- **Exploração de comportamento sem conclusão** → `/solution`. Aqui tudo é
  decidido; questão em aberto vira dúvida material, não alternativa.
- **Task, épico, estimativa, sequenciamento** → `/tasks`.
- **Step definition, código de teste** → `/tests`. Aqui há o cenário, não a
  implementação dele.
- **Requisito sem procedência.** Não existe. Campo vazio reprova o gate.
- **Dado real de cliente** (IDSD 4.10.1).
