# Proteção de Dados Pessoais — Regras Técnicas (transversal)

> O que o código, os testes e o pipeline fazem para tratar dado pessoal. Agnóstico de stack.
> Complementa [`logging-and-levels.md`](logging-and-levels.md) §3 (o que não registrar),
> [`nonfunctional-defaults.md`](nonfunctional-defaults.md) §3 (retenção) e
> [`api-security.md`](api-security.md) §5 (auditoria). Base legal, encarregado, RIPD e incidente são
> decisões de **processo** com o DPO, não regra técnica deste arquivo; aqui entra o que a
> implementação precisa garantir. Claims vindas do RH-SSO: [`identity-rhsso.md`](identity-rhsso.md).

## 1. Classificação dos dados

- Todo campo persistido (tabela e coluna, atributo de evento, campo de log estruturado) está
  classificado em **arquivo versionado** como `nao_pessoal`, `pessoal`, `sensivel` ou `sigiloso`
  (sigilo bancário), com a finalidade.
- Um **teste automatizado** compara o esquema real (depois das migrations) com o arquivo e falha em
  campo não classificado ou classificado e inexistente.
- Dado pessoal **derivado** (perfil, pontuação, agregação por pessoa) é inventariado como dado novo.
- Campo de texto livre (observação, justificativa) é classificado como potencialmente pessoal.

## 2. Minimização na borda e na interface

- Atributo pessoal vindo de fonte externa (provedor de identidade, integração, carga de arquivo)
  passa por **lista fechada**, verificada por teste; o resto é descartado na borda, antes do log e da
  persistência.
- Reintroduzir dado descartado de propósito é decisão registrada, não contorno técnico (ex.: guardar
  o e-mail do token porque o diretório corporativo não responde).
- A interface mostra o mínimo: identificador de pessoa **mascarado** em listagem quando o papel não
  precisa do valor completo; campo sensível **oculto** até ação explícita, e a ação é auditada (§5).
- Dado pessoal nunca é chave técnica, nome de arquivo, parâmetro de URL (ver
  [`api-standards.md`](api-standards.md)), chave de cache, nome de fila ou de objeto de
  armazenamento: usar identificador técnico sem significado.

## 3. Dados de teste e ambientes não produtivos

- Dado real **não existe** no repositório (histórico, branches, tags), fixtures, sementes,
  snapshots, capturas de tela, catálogo de componentes, documentação, descrição de PR e log do
  pipeline.
- Dado de teste é **sintético** e reconhecível: e-mail só em domínio reservado (`example.com`,
  `example.org`, `.test`, `.invalid`); nome de gerador ou lista fictícia; CPF/CNPJ gerado e
  registrado em **lista de permissão** versionada (identificador válido ao acaso pode coincidir com
  pessoa real), ou inválido de propósito quando a validação não é o objeto do teste.
- O pipeline roda **varredura de dado pessoal** sobre o repositório e sobre cada mudança, com os
  padrões do domínio (CPF/CNPJ com dígito válido, e-mail fora dos domínios reservados, telefone,
  cartão com Luhn válido, matrícula no formato da casa, agência e conta). Achado fora da lista de
  permissão reprova.
- Cópia de produção para ambiente não produtivo só **anonimizada**, por rotina versionada e testada;
  o teste prova que nenhum campo `pessoal`, `sensivel` ou `sigiloso` sai com o valor original.
  Pseudonimizar sozinho não é anonimizar. Ambiente que recebe cópia não anonimizada passa a ser
  ambiente de produção para acesso, log, retenção e incidente.

## 4. Log e telemetria

- O log estruturado usa **lista de permissão de campos**: entram só os campos declarados no esquema
  de log e classificados (§1). Objeto de domínio, requisição, resposta ou token nunca é serializado
  inteiro.
- O ator é registrado por **identificador técnico** ou pseudônimo, não por nome, e-mail ou documento;
  a tabela de correspondência fica no sistema, com acesso restrito.
- Um **teste canário** executa os fluxos principais com um titular sintético de valores marcados
  (nome `CANARIO-PD`, e-mail `canario@example.test`) e falha se algum aparecer no log, na mensagem de
  erro exibida, na URL ou no evento de telemetria capturado.
- Nome, e-mail e matrícula são dado pessoal comum: seguem a regra de mascaramento da §3 de
  [`logging-and-levels.md`](logging-and-levels.md) quando a lista de permissão não os declarar.
- Logs têm **retenção definida** e acesso restrito a papéis operacionais.

## 5. Acesso a dado pessoal

- Cada papel acessa só os dados necessários à função. O teste de autorização cobre a **leitura** de
  dado pessoal, com casos negativos, não só a escrita.
- Geram **registro de acesso** (append-only, ver [`api-security.md`](api-security.md) §5): leitura de
  dado `sensivel` ou `sigiloso`; exportação, relatório ou consulta que devolva dados de muitos
  titulares; revelação de campo mascarado; acesso administrativo ou de suporte a dado de titular.
- O registro tem quem, quando, qual operação, sobre quais titulares (por identificador técnico) e
  justificativa quando exigida; não duplica o conteúdo pessoal acessado.
- Exportação tem finalidade declarada na especificação, formato e destino definidos.
- Acesso direto à base de produção por pessoa é excepcional, nominal, registrado e por tempo limitado;
  conta compartilhada não existe.

## 6. Cifra, pseudonimização e anonimização

- Dado pessoal trafega **cifrado em toda rede**, inclusive interna; base, réplicas e cópias de
  segurança são cifradas em repouso.
- Dado `sensivel` ou `sigiloso` tem cifra de campo ou de registro, com chave gerida fora da base
  (cofre), para que acesso à base sem a chave não revele o valor.
- Chave ou tabela de correspondência de pseudônimo fica em ambiente separado e controlado; dado
  pseudonimizado continua sendo dado pessoal.
- Anonimização é **verificada** antes de tratar o dado como não pessoal: o plano descreve a técnica e
  o risco de reidentificação; na dúvida, o dado continua pessoal.
- Ambientes são segregados: dado de produção não é acessível a partir do desenvolvimento.

## 7. Retenção e eliminação

- Cada dado pessoal tem **prazo** e **destino final** (eliminação ou anonimização) com o fundamento do
  prazo; "indeterminado" não é aceito. O padrão de [`nonfunctional-defaults.md`](nonfunctional-defaults.md)
  vale até a área dona decidir.
- Exclusão lógica desfaz engano e cumpre retenção; não é guarda perpétua. Ao fim do prazo, **rotina
  automática**, versionada e auditada elimina ou anonimiza.
- Um teste com **relógio simulado** prova a eliminação no prazo e a preservação antes dele.
- A trilha de auditoria referencia o titular por **identificador técnico**, para que eliminar o
  cadastro não exija editar a trilha, e tem prazo próprio com fundamento.
- Cópia de segurança tem retenção compatível; dado eliminado na base **não é restaurado** ao ambiente
  ativo sem reaplicar as eliminações pendentes.
- Logs, filas, caches, índices de busca, arquivos temporários e exports entram no plano de retenção,
  não só a base principal.

## 8. Direitos do titular

- O sistema permite ao controlador atender, a partir do identificador do titular e **sem consulta
  manual à base**: **extração** de todos os dados do titular classificados como pessoais, em formato
  estruturado; **correção**, com registro de quem corrigiu; **eliminação ou anonimização** do que for
  desnecessário ou tratado com consentimento.
- Um teste compara o conteúdo da extração com o arquivo de classificação (§1) e falha se faltar
  campo ligado ao titular.

---

## Checklist

- [ ] Campos classificados em arquivo versionado; teste do esquema contra a classificação
- [ ] Atributos externos em lista fechada, com teste; o resto descartado na borda
- [ ] Máscara por padrão; revelação auditada; dado pessoal nunca como chave, nome de arquivo, cache ou fila
- [ ] Dados de teste sintéticos; lista de permissão versionada; varredura de dado pessoal no pipeline
- [ ] Cópia de produção só anonimizada, com teste da rotina
- [ ] Log por lista de permissão de campos; teste canário; ator por identificador técnico
- [ ] Autorização de leitura testada com casos negativos; registro de acesso para sensível, exportação, revelação e suporte
- [ ] Cifra em trânsito interno e em repouso; cifra de campo para sensível/sigiloso
- [ ] Prazo e destino por dado; rotina automática testada com relógio simulado; backups, filas, caches e logs no plano
- [ ] Extração por titular coberta por teste contra a classificação
