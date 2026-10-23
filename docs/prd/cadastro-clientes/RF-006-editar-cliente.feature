Funcionalidade: Usuário edita cadastro de cliente
  Como usuário autenticado
  Quero corrigir ou completar os dados de um cliente já cadastrado
  Para manter o cadastro atualizado

  Cenário: SCN-006.1 — Edição de cliente bem-sucedida
    Dado que um cliente já está cadastrado
    Quando o usuário altera um ou mais dos seus campos e confirma
    Então o cadastro passa a refletir os dados atualizados

  Cenário: SCN-006.2 — Edição deixaria campo obrigatório vazio
    Dado que a alteração proposta deixaria um campo obrigatório em branco
    Quando o usuário tenta confirmar a atualização
    Então o sistema recusa a atualização e mantém o dado anterior

  Cenário: SCN-006.3 — Duas edições concorrentes no mesmo cliente
    Dado que dois usuários editam o mesmo cliente ao mesmo tempo
    Quando as duas confirmações chegam ao sistema
    Então a última confirmação prevalece, sem bloqueio nem aviso de conflito
