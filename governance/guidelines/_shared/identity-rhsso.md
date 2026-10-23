# Identidade Corporativa — RH-SSO na Prática (transversal)

> Complementa [`api-security.md`](api-security.md) §1–2 (validar token, transcode) e
> `frontend/_shared/spa-bff.md` (BFF como cliente OIDC) com o que só aparece ao
> integrar com o RH-SSO real: cadastro, claims, permissões, origem pública, sessão e validação.
> Tipo de cliente, `SameSite` e a origem dos papéis seguem `api-security.md` e `spa-bff.md`.
> Neste conjunto, "RH-SSO" designa o **RHBK 26.x** (Red Hat build of Keycloak); ver a §10.

## 0. Termos

| Termo | Significa |
|---|---|
| **Trancode** | Nome com que o banco chama uma permissão, no formato `T_<SIGLA>_<PERMISSÃO>`, **um por tela ou função** (ex.: `T_XYZ_PARAMETROS`). Persistido no **LDAP**; o RH-SSO só o apresenta no token. |
| **Grupo de permissões** | `P_<SIGLA>_<GRUPO>`: conjunto de trancodes de um perfil de negócio (ex.: `P_XYZ_ADMINISTRADOR`). |
| **Grupo de usuários** | `G_...`: liga pessoas a grupos de permissões; a cargo de quem cadastra a IEP, não do sistema. |
| **IEP** | Especificação de Perfis de Acesso do sistema: cadastro institucional com o sistema, as unidades responsáveis, as permissões e os usuários de serviço. |
| **EPA** | O documento da especificação de perfis que o sistema entrega para o cadastro na IEP (permissões, grupos de permissões, grupos de usuários, usuários de serviço), versionado no repositório em `docs/iep/`. |
| **Transcode** | Troca de token (RFC 8693) de [`api-security.md`](api-security.md) §2. **Não** é o trancode: um é token, o outro é permissão. |
| **Claims `bns*`** | Claims institucionais (lotação, localização, descrições) entregues por um client scope próprio, fora do OIDC padrão. |

## 1. Permissões e papéis

- A **IEP é aberta antes de qualquer outro pedido** ao RH-SSO. Sem trancode no LDAP não há role no
  token, e sem role não há autorização.
- O sistema tem **prefixo próprio** de trancode. Antes de adotá-lo, conferir prefixos e usuários de
  serviço de sistemas com sigla parecida e registrar a colisão de leitura.
- **Toda permissão é externa ao sistema.** Quem tem cada permissão é decidido no processo da IEP e
  chega no token; o sistema **não mantém** lista de perfis (administradores, responsáveis) em
  parâmetro, tabela ou tela, nem consulta o diretório para decidir acesso. Revogação vale quando o
  token é renovado.
- **Um trancode por tela ou função.** Grupos de permissões (`P_<SIGLA>_<GRUPO>`) agrupam os
  trancodes de cada perfil de negócio; trancode por perfil (um só por papel) é menos granular e não
  dá permissão própria à tela. Leitura de apoio usada por várias telas (lista para um seletor) aceita
  **qualquer uma** das permissões dessas telas.
- **EPA no repositório.** `docs/iep/` traz o EPA e a matriz permissão × rota; os nomes do EPA são os
  literais do código. Trancode cadastrado com nome diferente do que o código procura **não dá erro**:
  a pessoa entra sem permissão.
- O mapeamento papel ↔ trancode vive em **um único ponto** do código, a fronteira entre os dois
  vocabulários; o domínio não conhece trancode. O teste fixa cada trancode como **literal**, sem
  derivá-lo da constante do prefixo, e amarra os literais ao EPA (o mesmo vale para o literal que a
  SPA usa no menu).
- O mapeamento é idêntico ao da IEP vigente, conferido a cada mudança nela. **Trancode desconhecido**
  no token é ignorado sem derrubar o login e gera evento observável (aviso e métrica).
- **O grupo precisa expandir nos trancodes dentro do token.** O sistema reconhece só os trancodes;
  se o token trouxer o nome do grupo, a pessoa entra sem permissão e sem erro. Até o time de
  identidade confirmar a expansão, as permissões são concedidas individualmente.
- Incluir, retirar ou renomear trancode é **mudança de fluxo**: a análise responde quem executa cada
  etapa depois da mudança, e a especificação é atualizada antes do pedido. Etapa que fique sem
  executor tem contorno registrado como exceção com prazo.

## 2. Claims e identificação da pessoa

- O pedido de cadastro inclui a atribuição do **client scope** das claims `bns*`; o nome do scope
  pode mudar por ambiente e é confirmado em cada um. Sem ele o login funciona e a lotação chega vazia.
- O sistema declara uma **lista fechada** das claims que consome, com o significado de cada uma
  confirmado com o time de RH-SSO. Claim fora da lista não é lida.
- A pessoa é identificada pela **matrícula** (`preferred_username`); `name` é o nome de exibição.
  **CID identifica unidade**, nunca pessoa: código, esquema e histórico novos não chamam pessoa de CID.
- `bnscidlotacao` é a unidade a que a pessoa pertence e é a **única** que decide regra de negócio
  (gestor, alçada, roteamento). `bnscidlocalizacao` é onde a pessoa senta e **nunca** decide regra.
  As descrições (`bnsdescricaocid*`) são exibidas, nunca usadas como chave.
- Claim obrigatória ausente **recusa o login** com erro explícito. Lotação ausente gera evento e
  sinalização, e não é substituída por valor inventado.
- `email` só é consumido com finalidade registrada e não entra na sessão quando não é necessário a
  cada requisição (ver [`data-protection.md`](data-protection.md)).

## 3. Cadastro do cliente e TTLs

- Cada ambiente tem o próprio cliente no próprio realm. **Redirect URIs** e **post-logout redirect
  URIs** são exatas por ambiente, sem curinga; **Web Origins** é a origem exata, nunca `*`. Fluxo só
  Authorization Code (sem implicit e sem direct grant), com PKCE **S256**.
- A troca do código acontece no servidor; token não chega ao JavaScript da página.
- Antes do plano, o sistema obtém do time de RH-SSO, **por ambiente**: validade do access token,
  validade do refresh token, SSO session idle e max, e se a rotação de refresh token está ligada.
- Com access token curto, a renovação é **proativa**, antes do vencimento.
- Renovações concorrentes da mesma sessão são **serializadas**. Serialização em memória só vale com
  **uma réplica** e estratégia de implantação que não sobreponha versões; mais de uma réplica com
  rotação ligada exige coordenação entre réplicas. Réplica única é exceção registrada com condição de
  saída. A guarda da **sessão** em memória do BFF é a mesma exceção (réplica única, estratégia
  `Recreate` e saída em `SessionStore` de Redis; ver `frontend/_shared/spa-bff.md` §3).

## 4. Origem pública atrás da plataforma

- A origem pública de cada ambiente é **configurada explicitamente** e tem precedência sobre os
  cabeçalhos encaminhados e sobre a URL que o processo enxerga.
- A `redirect_uri` da ida ao RH-SSO e a da troca de código são **idênticas**, ambas montadas com a
  origem pública. Endereço de bind (`0.0.0.0`, porta interna, nome do pod) nunca aparece em URL
  enviada ao RH-SSO.
- **Todo** URL absoluto ou redirecionamento devolvido ao navegador ou ao RH-SSO — inclusive o
  redirect do próprio proxy da aplicação para o login — sai da origem pública configurada, nunca da
  URL interna da requisição.
- O host da `Route` é **fixado** e idêntico à origem pública (sem o esquema), pedido à plataforma
  (a `Route` é gerada pelo pipeline) e conferido depois do deploy: com host gerado pela plataforma
  ou divergente, o pod sobe, a tela abre e o login morre em
  `invalid_redirect_uri` sem dizer de onde veio ([`operations-and-readiness.md`](operations-and-readiness.md) §3).
- O teste cobre o **artefato de produção** atrás de proxy, não só o servidor de desenvolvimento.

## 5. Sessão e encerramento

- Cada cookie de sessão cabe em **4096 bytes**, contando nome, valor e atributos; o navegador
  descarta o excedente sem erro. O teste usa tokens do **tamanho real** dos tokens do realm. A
  guarda da sessão no servidor (ver `frontend/_shared/spa-bff.md`) elimina o risco.
- O logout destrói a sessão local **e** a do RH-SSO pelo `end_session_endpoint`, com `id_token_hint`,
  voltando para uma `post_logout_redirect_uri` registrada no cliente.
- O projeto registra com o time de RH-SSO se há logout central institucional e se o realm faz
  **back-channel logout**; se fizer, o sistema expõe o endpoint de recebimento ou registra a decisão
  de não suportar.
- Página com dado de negócio não é recuperável do cache do navegador depois do logout
  (`Cache-Control: no-store`).

## 6. Diretório de pessoas ("quem exerce o papel X")

O token responde só **quem é o usuário corrente**. Saber todas as pessoas de um papel (para
notificar, convocar, distribuir trabalho) é **pedido de infraestrutura** desde a primeira
especificação ([`operations-and-readiness.md`](operations-and-readiness.md) §4), nesta ordem:
bind somente leitura no LDAP consultando por trancode; usuário de serviço no RH-SSO com
`view-users`/`query-users`. O usuário de serviço é declarado na IEP.

- A origem do diretório é escolhida por configuração, num único ponto; adaptador sem implementação
  falha na subida dizendo o que falta pedir.
- Sem consulta ao provedor a cada requisição: **cache com TTL** e invalidação quando o cadastro muda.
- **Cadastro local** provisório é exceção com prazo, dono e revisão periódica; conjunto vazio para um
  papel é erro visível ao administrador, não envio a ninguém.

## 7. Ambientes e identidade simulada

- Por ambiente, o projeto registra base URL, realm e a confirmação de que a aplicação alcança
  `<emissor>/.well-known/openid-configuration`. O emissor é copiado do documento de descoberta, não
  montado: há servidor que mantém o prefixo `/auth` no caminho do realm. Em desenvolvimento as
  aplicações costumam compartilhar um realm do ambiente (ex.: `sfb-dev`), confirmado com o time de
  identidade.
- Emissor, cliente, chave de sessão e origem pública são lidos do ambiente **em tempo de execução**,
  nunca embutidos no build, e validados na **subida**.
- **Identidade simulada** só em desenvolvimento e teste, com trava na leitura da configuração e
  **teste que prove** que não liga em produção. Fixture de pessoa não chega a produção.

## 8. Diagnóstico

- Recusa do provedor é registrada com `error` e `error_description` devolvidos e o `correlationId`.
  Token, código de autorização e refresh token não entram em log (ver
  [`logging-and-levels.md`](logging-and-levels.md)).
- Trancode desconhecido, login sem lotação e falha de renovação geram evento observável.
- A documentação de operação mantém a tabela de sintomas:

| Sintoma | Causa provável |
|---|---|
| `invalid_client` em todo login | tipo de cliente cadastrado diferente do que o código suporta |
| `invalid_grant` na volta do login | `redirect_uri` da troca diferente da ida, ou código reutilizado |
| `redirect_uri` com `0.0.0.0` ou porta interna | origem pública não configurada |
| Login funciona e a unidade chega vazia | client scope das claims `bns*` não atribuído |
| Pessoa logada sem nenhum papel (sem erro) | trancode não criado no LDAP ou nome divergente do EPA; grupo que não expande nos trancodes; roles registradas em cliente que não é o lido pela API (§10) |
| Login "não acontece", sem erro | cookie acima de 4 KB descartado pelo navegador |
| Usuário devolvido ao login aleatoriamente | renovação concorrente entre réplicas com rotação ligada |
| Solicitação vai ao gestor errado | localização usada no lugar de lotação |

## 9. Validação no realm real

- Emissor OIDC falso é o padrão dos testes de unidade e integração e permite entregar a integração
  antes do cadastro do cliente.
- Antes da primeira promoção a homologação, e a cada mudança no realm, no cliente ou na IEP, a
  integração é **validada contra o realm do ambiente**: descoberta, claims `bns*` (lotação ×
  localização conferidas numa pessoa conhecida), papéis, TTLs, renovação, logout e `redirect_uri`
  pela rota pública. O resultado é registrado por ambiente.
- Token real carrega dado pessoal: não é colado em prompt de agente nem lido por ele; o registro da
  validação lista as claims observadas **sem** os valores pessoais.

## 10. RHBK (Keycloak 26.2+) na prática

> A plataforma de identidade é o **RHBK** (Red Hat build of Keycloak 26.x), chamado "RH-SSO" neste
> conjunto. O RH-SSO 7.x não tem o *Standard Token Exchange* descrito abaixo; a versão do realm de
> cada ambiente é confirmada com o time de identidade. Nada abaixo vale como verificado até a
> validação da §9 ser executada num realm real.

- **Standard Token Exchange** habilitado **no cliente confidencial** que faz a troca de
  [`api-security.md`](api-security.md) §2. O pedido leva `audience` com o client id da API de destino.
- O token recebido pela API traz o client id dela em `aud` por um **audience mapper** no cliente do
  frontend (o `azp` desse token é o cliente do frontend, não o da API).
- **O token de login precisa ter o cliente de troca no `aud`**: o audience mapper do cliente do
  frontend inclui o client id do cliente confidencial que faz a troca (além do da API). Sem isso o
  RHBK recusa o transcode com `403` e `access_denied: Client is not within the token audience`, e
  toda chamada à API e toda consulta de perfil falham.
- No `client_credentials` o `audience` do pedido é **ignorado**: o job depende de um audience mapper
  no próprio cliente.
- `iss` igual à **URL pública** do realm (a mesma origem pública da §4); `iss` diferente derruba a
  validação.
- Claims `preferred_username` e `name`. As **permissões** chegam como *client roles*, em
  `resource_access[<cliente>].roles`, lidas em **um ponto só**, sobre a lista fechada da §1, e
  recortadas pelo cliente configurado (variável de ambiente da API); `realm_access` e as roles de
  outros clientes **não são lidos**. Claim em formato inesperado vale como lista vazia, sem derrubar
  o login.
- **Token trocado e client roles (medido no RHBK 26.4).** No token exchange, o token trocado (o que a
  API lê) traz só as client roles do cliente da **audiência**, o da API; as roles registradas no
  cliente do frontend não chegam, mesmo com mapper de client roles no cliente de troca
  (`resource_access` vazio, `403` em tudo, sem erro). Por isso trancodes e grupos são registrados
  como roles **do cliente da API**, e a variável da API aponta para ele; registrá-los em outro
  cliente exige que o BFF peça as duas audiências na troca. A API lista a variável na readiness
  quando ausente.
- O **token de login** precisa só das claims de identidade (`sub`, `preferred_username`, `name`): a
  API é a única que lê as permissões e as devolve num endpoint (`GET /sessao` com `permissoes[]`); o
  BFF não lê papéis do token de login (`frontend/_shared/spa-bff.md` §3 e §6).
- JWKS no `jwks_uri` do documento de descoberta (por padrão
  `/realms/<realm>/protocol/openid-connect/certs`); a URL é configurável.
- O pedido de cadastro do cliente (§3) lista: Standard Token Exchange, audience mappers, escopos e o
  cliente em cujas roles os trancodes são registrados (o da API).

---

## Checklist

- [ ] IEP aberta antes dos demais pedidos; prefixo próprio conferido contra siglas parecidas
- [ ] Permissões externas: trancode `T_<SIGLA>_<PERMISSÃO>` por tela ou função, grupos `P_<SIGLA>_<GRUPO>`; nenhuma lista de perfis mantida pelo sistema
- [ ] EPA e matriz permissão × rota em `docs/iep/`; grupo expandido nos trancodes dentro do token (senão, concessão individual)
- [ ] Mapeamento papel ↔ trancode em um ponto, com teste de literais amarrado ao EPA; trancode desconhecido gera evento
- [ ] Lista fechada de claims; matrícula = `preferred_username`; só `bnscidlotacao` decide regra; claim obrigatória ausente recusa o login
- [ ] Redirect/post-logout URIs exatas, Web Origins sem `*`, PKCE S256; TTLs obtidos por ambiente antes do plano
- [ ] Renovação proativa e serializada; réplica única registrada como exceção (vale também para a sessão em memória do BFF)
- [ ] Origem pública configurada; `redirect_uri` de ida e volta idênticas; teste do artefato atrás de proxy
- [ ] Cookie ≤ 4096 B com token de tamanho real (ou sessão no servidor); logout com `id_token_hint`; back-channel registrado
- [ ] Diretório de pessoas pedido na primeira especificação; cache com TTL; conjunto vazio é erro visível
- [ ] Configuração OIDC lida em runtime e validada na subida; identidade simulada com trava testada
- [ ] Log de recusa com `error` e `error_description`; tabela de sintomas na documentação de operação
- [ ] Validação no realm real registrada por ambiente, sem valor pessoal
- [ ] RHBK: Standard Token Exchange no cliente, audience mappers (frontend e job), `iss` = URL pública, permissões em `resource_access[<cliente>].roles` lidas num ponto
- [ ] RHBK: token de login com o cliente de troca no `aud` (senão `403 access_denied`); trancodes registrados como roles do cliente da API (o da audiência), ou duas audiências na troca
