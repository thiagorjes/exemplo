Funcionalidade: Admin global visualiza lista de usuários cadastrados, somente leitura
  Como admin global
  Quero ver a lista de usuários já criados
  Para conferir quem tem acesso ao sistema

  Cenário: SCN-003.1 — Lista de usuários exibida para o admin global
    Dado que existem usuários já criados
    Quando o admin global acessa a tela de gestão de usuários
    Então ele vê a lista com todos os usuários cadastrados, sem ações de editar ou excluir

  Cenário: SCN-003.2 — Nenhum usuário além do próprio admin global criado ainda
    Dado que nenhum outro usuário foi criado
    Quando o admin global acessa a tela de gestão de usuários
    Então o sistema indica que não há usuários cadastrados além dele

  Cenário: SCN-003.3 — Usuário comum não pode acessar a lista de usuários
    Dado que uma pessoa autenticada no papel usuário tenta acessar a tela de gestão de usuários
    Quando ela tenta abri-la
    Então o sistema recusa o acesso
