Funcionalidade: Usuário inclui cliente Pessoa Física
  Como usuário autenticado
  Quero cadastrar um cliente Pessoa Física
  Para registrar os dados mínimos exigidos para abertura de conta corrente

  Cenário: SCN-004.1 — Inclusão de cliente Pessoa Física bem-sucedida
    Dado que o usuário está autenticado
    Quando ele informa nome completo, CPF, data de nascimento, endereço e telefone de uma pessoa física ainda não cadastrada
    Então o sistema inclui o cliente e ele passa a aparecer na lista de clientes

  Cenário: SCN-004.2 — CPF já cadastrado para outro cliente
    Dado que já existe um cliente cadastrado com um determinado CPF
    Quando o usuário tenta incluir outro cliente Pessoa Física com o mesmo CPF
    Então o sistema recusa a inclusão

  Cenário: SCN-004.3 — Campo obrigatório vazio
    Dado que o usuário deixa em branco um dos campos obrigatórios do cadastro de Pessoa Física
    Quando ele tenta confirmar a inclusão
    Então o sistema recusa a inclusão e aponta o campo pendente
