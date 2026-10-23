Funcionalidade: Usuário inclui cliente Pessoa Jurídica, com sócios
  Como usuário autenticado
  Quero cadastrar um cliente Pessoa Jurídica com seus sócios
  Para registrar os dados mínimos exigidos para abertura de conta corrente

  Cenário: SCN-005.1 — Inclusão de cliente Pessoa Jurídica bem-sucedida
    Dado que o usuário está autenticado
    Quando ele informa nome fantasia, razão social, CNPJ, data de abertura, endereço, telefone e ao menos um sócio com nome completo e CPF
    Então o sistema inclui o cliente Pessoa Jurídica e ele passa a aparecer na lista de clientes

  Cenário: SCN-005.2 — CNPJ já cadastrado para outro cliente
    Dado que já existe um cliente cadastrado com um determinado CNPJ
    Quando o usuário tenta incluir outro cliente Pessoa Jurídica com o mesmo CNPJ
    Então o sistema recusa a inclusão

  Cenário: SCN-005.3 — Pessoa Jurídica sem nenhum sócio informado
    Dado que o usuário preenche os dados da empresa sem informar nenhum sócio
    Quando ele tenta confirmar a inclusão
    Então o sistema recusa a inclusão por faltar ao menos um sócio
