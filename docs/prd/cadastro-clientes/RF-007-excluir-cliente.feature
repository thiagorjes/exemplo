Funcionalidade: Usuário exclui cadastro de cliente
  Como usuário autenticado
  Quero remover definitivamente o cadastro de um cliente
  Para manter o cadastro limpo de registros indevidos

  Cenário: SCN-007.1 — Exclusão de cliente bem-sucedida
    Dado que um cliente está cadastrado
    Quando o usuário confirma a exclusão
    Então o cliente deixa de aparecer na lista de clientes ativa

  Cenário: SCN-007.2 — Cliente já excluído por outra sessão
    Dado que o cliente já havia sido excluído por outra sessão
    Quando o usuário tenta excluí-lo novamente
    Então o sistema informa que a operação não se aplica mais, sem tratar como erro técnico

  Cenário: SCN-007.3 — Exclusão é definitiva
    Dado que um cliente foi excluído
    Quando o usuário procura por esse cliente na lista de clientes ativa
    Então o sistema não oferece nenhuma forma de reativação — o cliente não aparece mais
