Funcionalidade: Usuário busca/lista clientes cadastrados
  Como usuário autenticado
  Quero ver e localizar os clientes já cadastrados
  Para incluir, editar ou excluir um cadastro

  Cenário: SCN-008.1 — Lista de clientes exibida
    Dado que existem clientes cadastrados
    Quando o usuário acessa a lista de clientes
    Então ele vê todos os clientes cadastrados

  Cenário: SCN-008.2 — Nenhum cliente cadastrado ainda
    Dado que nenhum cliente foi cadastrado ainda
    Quando o usuário acessa a lista de clientes
    Então o sistema indica que não há clientes cadastrados

  Cenário: SCN-008.3 — Acesso sem sessão autenticada
    Dado que não há uma sessão autenticada
    Quando alguém tenta acessar a lista de clientes diretamente
    Então o sistema recusa o acesso e exige login
