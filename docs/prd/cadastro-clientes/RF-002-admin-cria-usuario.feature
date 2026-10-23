Funcionalidade: Admin global cria usuário
  Como admin global
  Quero criar um novo usuário com CPF e senha
  Para que essa pessoa passe a conseguir autenticar-se no sistema

  Cenário: SCN-002.1 — Criação de usuário bem-sucedida
    Dado que o admin global está autenticado
    Quando ele informa um CPF válido ainda não cadastrado e uma senha com 8 ou mais caracteres
    Então o sistema cria o usuário e ele passa a constar na lista de usuários

  Cenário: SCN-002.2 — CPF já cadastrado para outro usuário
    Dado que já existe um usuário cadastrado com um determinado CPF
    Quando o admin global tenta criar outro usuário com o mesmo CPF
    Então o sistema recusa a criação e aponta o conflito

  Cenário: SCN-002.3 — Usuário comum não pode criar usuário
    Dado que uma pessoa autenticada no papel usuário tenta acessar a criação de usuário
    Quando ela tenta executar essa ação
    Então o sistema recusa a operação
