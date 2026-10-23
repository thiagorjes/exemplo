Funcionalidade: Logout
  Como pessoa autenticada (usuário ou admin global)
  Quero encerrar minha sessão explicitamente
  Para não depender só da expiração automática por inatividade

  Cenário: SCN-009.1 — Logout encerra a sessão
    Dado que a pessoa está autenticada
    Quando ela aciona a ação de sair
    Então a sessão é encerrada e qualquer operação seguinte exige novo login

  Cenário: SCN-009.2 — Logout com sessão já expirada por inatividade
    Dado que a sessão da pessoa já expirou por inatividade
    Quando ela aciona a ação de sair
    Então o sistema trata a sessão como já encerrada, sem erro

  Cenário: SCN-009.3 — Logout acionado duas vezes em sequência
    Dado que a pessoa aciona a ação de sair
    Quando a mesma ação é acionada uma segunda vez antes da primeira resposta
    Então a segunda chamada também encerra como sessão já encerrada, sem erro
