# Segurança na Exposição de APIs (transversal)

> Autenticação, autorização e endurecimento de APIs expostas. Agnóstico de stack;
> implementação concreta (filtros, configuração do resource server) em
> `backend/<stack>/spring-boot.md` ou equivalente. Cadastro do cliente, claims, permissões e
> validação no realm real: [`identity-rhsso.md`](identity-rhsso.md).

## 1. Modelo de identidade — RH-SSO (Keycloak/RHSSO)

- O **RH-SSO** é o Identity Provider corporativo (OpenID Connect / OAuth2).
- Toda API exposta atua como **OAuth2 Resource Server**: só aceita requests com
  `Authorization: Bearer <access_token>` emitido por um realm confiável do RH-SSO.
- O token é um **JWT** validado localmente (assinatura via JWKS do realm), sem round-trip por request.

### Validação obrigatória do token (a cada request)

- Assinatura contra o JWKS do issuer (cache do JWKS com rotação de chave).
- `iss` = issuer esperado do realm (a URL **pública** do realm, a mesma do documento de descoberta).
- `aud` **contém** o client id desta API. O `azp` é o cliente que obteve o token e **não substitui**
  o `aud`: o token que a própria API obtém por troca para um downstream tem `azp` igual ao client id
  dela, e passaria numa checagem só de `azp`. O `aud` do token do frontend vem de um *audience
  mapper* no cliente (ver [`identity-rhsso.md`](identity-rhsso.md) §10).
- `exp` / `nbf` / `iat` dentro da janela; _clock skew_ tolerado ≤ 60s. O `exp` é **obrigatório**:
  token sem `exp` é rejeitado (o validador de tempo padrão dos frameworks o aceita). Frameworks costumam
  validar só `exp`/`nbf` por padrão: `iat` exige validador próprio, coberto por teste de `iat` no
  futuro e de token sem `exp`.
- `scope` e/ou roles necessárias presentes (ver autorização).
- Rejeitar token opaco, `alg: none`, ou algoritmo fora da allowlist (`RS256`/`ES256`).
- Token inválido, expirado ou de emissor errado → `401`.
- A obtenção das chaves (JWKS) é **infraestrutura de autenticação do resource server**, não
  integração de negócio: qualquer falha ao obtê-las (timeout ou indisponibilidade do provedor de
  identidade) → `503`; não se propaga correlation id ao provedor; timeout e cache das chaves são
  configurados no decoder. As regras de `backend/java/integrations.md`
  (504 para timeout, retry, propagação de correlação) não se aplicam a ela, nem a exigência de
  `RestClient`: o decoder usa o cliente HTTP do próprio framework, configurado com timeout.
- O `503` precisa ser **forçado**: no Spring Security o filtro do resource server relança a falha de
  infraestrutura (`AuthenticationServiceException`) e a resposta sai como erro do contêiner (`500`).
  A falha de chaves vira exceção de infraestrutura (não `BadJwtException`, que vira `401`) e o
  *entry point* a traduz em `503` com `Retry-After`; teste com JWKS fora do ar (timeout, corpo
  inválido, conexão derrubada), em servidor real. Mecanismo em
  `backend/java/spring-boot.md` (Segurança).
- O decoder obtém as chaves de forma **lazy**: a subida da API não depende de o provedor de identidade
  estar no ar (a readiness e o `503` cobrem a indisponibilidade).

## 2. Transcode de token (token exchange RH-SSO)

Quando a API precisa chamar **outra API downstream** em nome do usuário, ela **não repassa
o token recebido**. Faz o *transcode* (OAuth2 Token Exchange, RFC 8693) no RH-SSO:

```
token do usuário (audience = API-A)
        │  POST /realms/<realm>/protocol/openid-connect/token
        │  grant_type=urn:ietf:params:oauth:grant-type:token-exchange
        │  subject_token=<token do usuário>  audience=API-B
        ▼
token de acesso novo (audience = API-B, escopo reduzido ao necessário)
```

Regras:

- Cada salto tem seu próprio token, com `audience` do destino e **escopo mínimo**.
- A troca é feita por um client confidencial dedicado (credenciais em cofre/segredo externo,
  nunca no código nem no repositório).
- Tokens transcodificados são cacheados por audience+subject até pouco antes do `exp`
  (margem ≥ 30s); nunca logados (ver [`logging-and-levels.md`](logging-and-levels.md)).
- Falha no transcode ⇒ `502`/`503` para o cliente (problema de infraestrutura de auth),
  não `401` (o usuário está autenticado).
- Chamadas *service-to-service* sem usuário no contexto usam `client_credentials`, com escopo
  específico — nunca um "superclient". No RHBK/Keycloak o parâmetro `audience` é **ignorado** no
  `client_credentials`: a audiência do token vem de um *audience mapper* no cliente do job.
- Requisitos do RHBK (Keycloak 26.2+) para a troca: [`identity-rhsso.md`](identity-rhsso.md) §10.
  No RHBK 26.4 o token trocado traz só as client roles do cliente da **audiência**: a API que
  autoriza por roles as recebe registradas no próprio cliente dela.

## 3. Autorização

- **Autenticação ≠ autorização.** Todo endpoint declara explicitamente a permissão exigida;
  o default de qualquer rota não mapeada é **negar**.
- Autorização baseada em `scope` (o que o client pode) + roles/claims (o que o usuário pode).
- A permissão do usuário vem **só do token**: trancodes por tela ou função, em client roles do
  cliente da API ([`identity-rhsso.md`](identity-rhsso.md) §1 e §10). A API não mantém lista de
  perfis; cada rota declara a permissão exigida (uma, ou qualquer uma de uma lista) e é a única que
  decide. Ela expõe as permissões reconhecidas num endpoint de sessão (`GET /sessao`), que BFF e
  SPA usam só para menu e guarda de rota.
- Checagem grosseira (tem acesso ao endpoint) na borda; checagem fina (é dono do recurso /
  está no segmento autorizado, quando o requisito definir segmentação) no serviço, sobre dados reais — nunca confiando em id vindo do cliente.
- `403` quando autenticado sem permissão; `404` quando não se deve revelar a existência do recurso.
- Sem autorização baseada só em algo controlável pelo cliente (header custom, campo no body).

## 4. Endurecimento da exposição

- **HTTPS/TLS obrigatório** em toda borda; HSTS habilitado. Sem downgrade para HTTP.
- CORS restritivo: allowlist explícita de origens, métodos e headers; sem `*` com credenciais.
- Rate limiting / throttling por client e por IP na borda (gateway) — resposta `429` com `Retry-After`.
- Tamanho máximo de payload e de upload configurados; timeouts de leitura/escrita.
- Headers de resposta: `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` em respostas
  com dado sensível, sem header que exponha versão de framework/servidor. Se o contrato do sistema
  fixa `no-store` **exato** em toda resposta (inclusive erro), o cabeçalho de cache do framework de
  segurança é desligado e um filtro próprio o escreve por último; teste em todas as rotas, com e sem
  autenticação.
- Bean Validation / validação de schema em **todo** input; rejeitar campo desconhecido quando o
  contrato for estrito.
- Documentação (Swagger UI) protegida ou desabilitada em produção (ver `openapi-swagger.md`).
- Mensagem de erro sem stack trace, SQL, host interno ou nome de classe (RFC 7807, ver
  [`api-standards.md`](api-standards.md)).
- Segredos (client secret do transcode, chaves, credenciais de banco) só via configuração
  externa / cofre; proibido em código, `application.yml` versionado ou variável de imagem.

## 5. Auditoria

- Eventos de segurança relevantes (login falho repetido, `403`, uso de escopo administrativo,
  transcode para audience sensível) registrados em `INFO`/`WARN` com `correlationId`, sujeito e
  ação — sem o token em si.
- **Alteração de dado** é auditada na **mesma transação** da escrita: se o evento não puder ser
  gravado, a operação inteira falha (sem escrita sem trilha). Assim o "100% das alterações
  auditadas" vale sem exceção — nada de gravar a auditoria depois do commit.
- **Negação de acesso e eventos de segurança** não têm transação de negócio para acompanhar: se o
  armazenamento de auditoria falhar, a resposta ao cliente não muda, e a falha vira log `ERROR` com
  `correlationId` e métrica com alerta. O "100% das negações auditadas" vale salvo essa
  indisponibilidade, que precisa ser observável.
- Evento gerado por job ou migração (carga, expurgo) usa um **operador técnico identificado**
  (ex.: `SISTEMA:expurgo`, `MIGRACAO`), nunca nulo, e um correlation id gerado pelo próprio job.
- **Imutabilidade garantida no armazenamento, não só no código.** A tabela de auditoria é
  *append-only*: o usuário com que a aplicação se conecta **não tem** `UPDATE` nem `DELETE` sobre ela
  (a migration não os concede), e não é o dono da tabela — com a migração no passo da esteira, o dono
  é o usuário da esteira e as migrations concedem ao da aplicação só o necessário
  (`backend/java/database.md` §1). Um teste de integração no banco real (perfil `-P<banco>-it`, ver
  `backend/java/testing.md`) tenta alterar e apagar um evento como a aplicação e espera falha.
- O expurgo de retenção (ver [`nonfunctional-defaults.md`](nonfunctional-defaults.md) §3) é a única
  exceção e recebe só o privilégio que a retenção exige (`DELETE`, ou `UPDATE` apenas das colunas de
  anonimização). Roda com **papel de banco próprio** quando o DBA o entrega; com **um único usuário**
  de aplicação (o caso comum), o job usa esse usuário, que recebe esse privilégio, e a separação
  aplicação × expurgo perdida é registrada como risco aceito no plano. O evento de resumo do expurgo
  é gravado pela conexão da **aplicação**, que tem `INSERT` na tabela de auditoria.
- Aplicação **dona** das tabelas (migração fora da esteira, com o único usuário) perde a barreira no
  banco: a imutabilidade passa a depender do código e dos testes de regra. É desvio registrado em ADR,
  com duas aprovações quando a constituição do sistema exige privilégio mínimo.
- Conteúdo do evento de alteração: instante com fuso, ator, ação, **estado anterior**, **estado
  resultante** e justificativa quando a regra de negócio a exige. Registro com retenção usa exclusão
  lógica; apagar fisicamente só pela rotina administrativa auditada.
- Leitura de dado sensível, exportação, revelação de campo mascarado e acesso de suporte também
  geram registro (ver [`data-protection.md`](data-protection.md) §5).

---

## Checklist

- [ ] API configurada como OAuth2 Resource Server; JWT validado localmente (assinatura, `iss`, `aud` — não só `azp` —, `exp` obrigatório, `nbf`, `iat` com validador próprio, `alg` allowlist); falha de JWKS → `503`
- [ ] Downstream chamado com token **transcodificado** (audience + escopo mínimo), nunca o token repassado
- [ ] Client secret do transcode em cofre/segredo externo; token transcodificado cacheado e nunca logado
- [ ] Todo endpoint com permissão explícita; default = negar; checagem fina de posse no serviço
- [ ] Permissão só do token (trancodes em client roles do cliente da API); sem lista de perfis na aplicação; `GET /sessao` com as permissões reconhecidas
- [ ] TLS obrigatório, CORS allowlist, rate limit `429`, limite de payload, headers de segurança
- [ ] Erros sem vazamento; Swagger protegido/desligado em produção
- [ ] Alteração de dado auditada na mesma transação; negação e eventos de segurança auditados com `correlationId`, sem token, com falha da auditoria virando `ERROR` + alerta
- [ ] Tabela de auditoria sem `UPDATE`/`DELETE` para o usuário da aplicação (que não é o dono), com teste no banco real; expurgo só com o privilégio da retenção (papel próprio, ou o usuário único com o risco registrado)
