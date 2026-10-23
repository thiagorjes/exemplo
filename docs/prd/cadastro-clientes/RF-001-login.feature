Funcionalidade: Login
  Como uma pessoa com usuário criado por um admin global
  Quero autenticar-me com CPF e senha
  Para acessar as funcionalidades do meu papel no sistema

  Cenário: SCN-001.1 — Login bem-sucedido
    Dado que a pessoa possui um usuário criado por um admin global
    Quando ela informa o CPF e a senha corretos
    Então o sistema inicia uma sessão autenticada no papel correspondente ao usuário

  Cenário: SCN-001.2 — Credencial inválida não revela se o CPF existe
    Dado que uma pessoa informa um CPF sem usuário cadastrado ou uma senha incorreta para um CPF existente
    Quando ela tenta entrar no sistema
    Então o sistema recusa o acesso com a mesma mensagem genérica nos dois casos

  Cenário: SCN-001.3 — Sessão expira após 5 minutos de inatividade
    Dado que uma sessão autenticada ficou 5 minutos sem nenhuma ação
    Quando a pessoa tenta realizar uma nova operação
    Então o sistema exige que ela se autentique novamente
