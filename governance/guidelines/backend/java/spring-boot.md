# Spring Boot 4 + Java 25 — Boas Práticas

> Substitui o antigo `GUIDELINE_SPRING.MD` (citado no README mas inexistente).
> Segurança de exposição (resource server, transcode RH-SSO): [`_shared/api-security.md`](../../_shared/api-security.md).

## Configuração

- `application.yml` por profile (`application-<profile>.yml`); profile ativo via
  `SPRING_PROFILES_ACTIVE`. Sem lógica de negócio dependendo de profile.
- Toda config parametrizável em `@ConfigurationProperties(prefix = "...")` (record) com
  `@Validated` e Bean Validation nos campos. Sem `@Value("${...}")` espalhado pelo código.
- Registrar via `@EnableConfigurationProperties(ApiSettings.class)`.
- Segredos (senha de banco, client secret) **não** vão no `application.yml` versionado —
  vêm de variável de ambiente injetada por secret do OpenShift / cofre.
- O pipeline entrega o `ConfigMap` e o `Secret` (`configuration/configmap/<app>.yml` e
  `configuration/secret/<app>.yml` em desenvolvimento) como variáveis de ambiente, por `envFrom`
  ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.2): a chave é o nome
  da variável, sem ponto, e a propriedade chega ao Spring pela ligação relaxada
  (`SPRING_PROFILES_ACTIVE`, `APP_SESSAO_TIMEOUT` para `app.sessao.timeout`), nunca como arquivo
  `application.yml` montado.
- `spring.jpa.hibernate.ddl-auto=validate` (nunca `update`/`create` fora de teste).
- Banco: o datasource lê a URL de `DATABASE_URL` (do `ConfigMap`) e usuário e senha do `Secret`;
  `spring.flyway.enabled=false` nos perfis dos ambientes implantados, porque a migração é do passo
  da esteira ([`database.md`](database.md) §1). O Flyway do Boot, com os placeholders de H2, fica
  nos testes, no perfil local e no `-P<banco>-it`.

## Web / REST

- `@RestController` fino; `@RequestMapping("/v1/<recurso>")` no nível da classe.
- `@Valid` em todo `@RequestBody`; `@Validated` na classe para validar `@PathVariable`/`@RequestParam`.
- Bean Validation no record cobre o formato de cada campo. A **coerência entre campos** do mesmo
  payload (ex.: fim ≥ início) é validada no início do service, antes de trava ou transação, com `400`
  e o campo em `errors[{ field, message }]` — o mesmo vale para o resultado da mescla do `PATCH`. Não use constraint
  de classe para isso: ela cria uma propriedade sintética no OpenAPI.
- Status explícito: `@ResponseStatus` ou `ResponseEntity` conforme [`_shared/api-standards.md`](../../_shared/api-standards.md).
- `@RestControllerAdvice` único traduz exceções → `ProblemDetail`. Sem `try/catch` de
  tradução no controller. O handler da exceção de negócio preenche `type` (URN da categoria,
  `urn:<sistema>:erro:<categoria>`), `title` (fixo da categoria), `detail` (português, escrito para
  exibição, sem dado técnico nem pessoal), `codigoRegra` (do enum de códigos) e o membro de extensão
  `dadosApoio` (`setProperty`, só se não vazio), mais `traceId`; membro ausente é omitido, nunca
  `null`. Validação de Bean Validation (`MethodArgumentNotValidException`,
  `ConstraintViolationException`, `HttpMessageNotReadableException`) vira `400` de categoria
  `validacao` com `errors[{ field, message }]`: `field` é o caminho aninhado, `corpo`, o nome do
  parâmetro ou do cabeçalho, e `message` sai de `mensagens.properties`/catálogo da API (por código
  estável da constraint, que pode ir também em `code`), **nunca** do texto padrão do Bean Validation.
  Resposta com `Content-Type: application/problem+json`. Formato em
  [`_shared/api-standards.md`](../../_shared/api-standards.md) §3; exceção com código em
  [`coding-standards.md`](coding-standards.md).
- **Paginação:** a resposta paginada sai como **record plano** `{ content, page, size,
  totalElements, totalPages }` (`page` é o número da página, 0-based), montado no service ou no
  controller a partir do `Page` do repositório; o `Page` não é serializado direto (estrutura diferente
  e instável) nem outro tipo do Spring Data. Parâmetros `page` e `size` (padrão 20, máximo 100): valor
  fora do limite responde `400` no campo. A ordenação é fixa por endpoint, com nulos por último em
  ordem crescente e primeiro em decrescente e desempate por `id`. O teste de controller trava o
  formato ([`testing.md`](testing.md) §3). Em `POST /<recurso>/consultas` paginado, `page` e `size`
  vêm no corpo junto dos filtros e o service monta o `Pageable`; consulta sem paginação devolve um
  record próprio.
- **Concorrência e idempotência:** o recurso expõe `versao` (inteiro) e quem altera a envia no corpo
  (ausente → `400` no campo `versao`; divergente → `409` categoria `conflito-versao`); o `PATCH`
  aceita `application/json` e `application/merge-patch+json`, e `If-Match` é alternativa admitida.
  `Idempotency-Key` conforme [`_shared/api-standards.md`](../../_shared/api-standards.md) §4. As
  respostas levam `Cache-Control: no-store`; o `201` leva `Location` relativo com o prefixo
  versionado.
- Sem `ResponseEntity<Object>` genérico; tipar a resposta.

## Persistência

- Detalhes em [`database.md`](database.md). Resumo: entity só para escrita; leitura via
  projeção `record`; `@Transactional(readOnly = true)` em consulta; transação curta, sem I/O
  de rede dentro dela.

## Segurança

- `SecurityFilterChain` como bean; `authorizeHttpRequests` com **deny-by-default**
  (`.anyRequest().denyAll()` ao final). Consequência: rota não declarada responde `401` (sem token)
  ou `403` (com token); `404` e `405` só existem para rotas declaradas, e a especificação não deve
  prometer outra coisa.
- **Rotas declaradas:** pode-se declarar as rotas numa **tabela única** (método + caminho) que o
  `authorizeHttpRequests` aplica com `authenticated()`, mantendo `anyRequest().denyAll()` no fim — a
  tabela implementa o deny-by-default, não o substitui. A permissão por endpoint (trancode, uma ou
  qualquer uma de uma lista) fica numa anotação (ex.: `@ExigePermissao`) lida por interceptor: rota
  sem permissão declarada responde `403` com evento; a rota de sessão (`GET /v1/sessao`, que devolve
  as permissões reconhecidas) exige só autenticação. Um teste liga a
  tabela aos controllers (rotas declaradas = rotas dos controllers). O `405` só existe para a rota
  declarada **com o método**. No Spring Security 7 os *matchers* de caminho usam
  `PathPatternRequestMatcher` (o `AntPathRequestMatcher` foi descontinuado em favor dele; confirmar na
  versão em uso).
- `oauth2ResourceServer(oauth2 -> oauth2.jwt(...))` com `JwtDecoder` validando `issuer`, `audience`
  (**`aud` contém o client id da API**, não só `azp`), `exp` obrigatório, `iat` e os algoritmos
  `RS256`/`ES256` ([`api-security.md`](../../_shared/api-security.md) §1); o decoder é *lazy* (a subida
  não depende do provedor); permissões lidas num ponto só de `resource_access[<cliente>].roles`, com
  o cliente em `@ConfigurationProperties` (o da audiência da API) e listado na readiness quando
  ausente ([`identity-rhsso.md`](../../_shared/identity-rhsso.md) §1 e §10).
- **503 do JWKS:** o filtro do resource server relança `AuthenticationServiceException` e o contêiner
  responde `500`. Para sair `503` com `Retry-After`: `ObjectPostProcessor<BearerTokenAuthenticationFilter>`
  com `AuthenticationEntryPointFailureHandler` e `setRethrowAuthenticationServiceException(false)`;
  o decoder converte a falha de obter as chaves em exceção simples (`JwtException`), não em
  `BadJwtException` (que vira `401`), e o *entry point* traduz a falha de infraestrutura em `503`.
  Teste com JWKS fora do ar (timeout, corpo inválido, conexão derrubada) em servidor real.
- CSRF desabilitado só para API stateless com JWT; `SessionCreationPolicy.STATELESS`.
- Chamada a downstream usa token transcodificado (lib `banestes-token-rhsso`), nunca o token
  recebido.

## Observabilidade

- `spring-boot-starter-actuator`: expor `health`, `info`, `prometheus`; **não** expor `env`,
  `beans`, `heapdump` em produção.
- `/actuator/health` com liveness/readiness para o OpenShift.
- Actuator na **porta de gestão** (`management.server.port`, ex.: `8081`), não exposta pela Route.
  Ela tem `SecurityFilterChain` própria (`securityMatcher(EndpointRequest.toAnyEndpoint())`,
  `@Order` antes da cadeia da API) que libera só `health`, `info` e `prometheus` sem token e nega o
  resto; a cadeia da API continua terminando em `denyAll`. Teste com servidor real
  (`webEnvironment = RANDOM_PORT` + porta de gestão aleatória) chamando as probes sem token.
- **Exceção — porta única.** Só quando a plataforma ou a esteira sonda apenas a porta da aplicação
  (confirmado pelo time de plataforma, com a evidência registrada em ADR), API e Actuator ficam na
  mesma porta. Exige: Route com `spec.path` restrito ao prefixo da API (ex.: `/v1`), nunca mais
  amplo; cadeia `gestao` (`EndpointRequest`, `@Order` antes da cadeia da API) que libera sem token só
  `health`, `info` e `prometheus` (`management.endpoints.web.exposure.include` com os mesmos três),
  seguida de `anyRequest().denyAll()`; *NetworkPolicy* de entrada (não opcional) e Route restrita
  pedidas à plataforma, porque o pipeline gera os objetos de implantação
  ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.2); sondas `startup`,
  `liveness` e `readiness` pela porta **nomeada** (o número da porta aparece num só lugar da
  configuração); teste com servidor real na porta da API, inclusive com URI
  crua (`/v1/../actuator/prometheus`), que nunca responde `200`. O ADR registra o risco: um prefixo
  de Route mais amplo que a API expõe o Actuator. Os detalhes da readiness (nomes de variável) só
  circulam dentro do cluster ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §1).
- A readiness exercita a configuração obrigatória (emissor OIDC, secrets) e, ao falhar, lista o que
  falta pelo nome, sem valor; as probes não têm autenticação nem redirecionamento
  ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §1). A configuração OIDC é
  lida em runtime e validada na subida ([`identity-rhsso.md`](../../_shared/identity-rhsso.md) §7).
- Log estruturado + `correlationId` propagado (filtro/MDC) — ver [`_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md).
  Em homologação e produção, JSON no formato ECS (um evento por linha, `correlationId` como campo);
  nos demais perfis, padrão de texto com o correlation id do MDC.
- Métrica de latência por histograma, com buckets exatos nas metas de desempenho
  (`management.metrics.distribution.slo`); o percentil vem do Prometheus (`histogram_quantile`), não do
  cliente.
- Job agendado (CronJob do OpenShift) roda com o perfil do ambiente **mais** o perfil do job
  (ex.: `SPRING_PROFILES_ACTIVE=prod,expurgo`), sem a camada web
  (`spring.main.web-application-type=none`); beans web e de segurança HTTP ficam fora desse modo
  (`@ConditionalOnWebApplication`, inclusive o decoder JWT). O job encerra o próprio contexto com
  `SpringApplication.exit`, nunca `System.exit`. O `CronJob`, que o pipeline não gera, fica em
  `configuration/cronjob/<app>.yml`, só o de desenvolvimento
  ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §2.2).

## Resiliência

- Timeout obrigatório em todo `RestClient` (ver [`integrations.md`](integrations.md)).
- Retry só para falha transitória e idempotente, com limite e espera, via `@Retryable` do
  Spring Framework (`@EnableResilientMethods` em `config/`).
- Sem `@Async`/thread manual sem necessidade; se usar, `TaskExecutor` configurado e limitado.

## Java 25

- `record` para DTO e projeção; `sealed` para hierarquias fechadas de domínio.
- `switch` com pattern matching em vez de cadeia de `if instanceof`.
- Sem preview features em produção.
- Virtual threads (`spring.threads.virtual.enabled=true`) permitido, mas avaliar impacto em
  código bloqueante com `synchronized` e pools de conexão antes de habilitar.

## Startup / build

- Fat jar via `spring-boot-maven-plugin`; imagem por Dockerfile/buildpack padrão da esteira.
- Falhar rápido: config inválida no startup derruba a aplicação (não degradar silenciosamente).

## Checklist

- [ ] Config em `@ConfigurationProperties` validado; segredos fora do yaml versionado
- [ ] `ddl-auto=validate`; migrations via Flyway no passo da esteira, com `spring.flyway.enabled=false` nos ambientes implantados
- [ ] Permissão por endpoint (trancode) em anotação lida por interceptor; permissões de `resource_access[<cliente>].roles` lidas num ponto
- [ ] `SecurityFilterChain` deny-by-default; resource server validando `iss` + `aud`; stateless
- [ ] Downstream com token transcodificado
- [ ] Actuator só com endpoints seguros, na porta de gestão com cadeia própria (ou, por exceção em ADR, porta única com Route restrita à API e NetworkPolicy); probes testadas sem token
- [ ] `aud` com o client id da API, `exp` obrigatório, decoder lazy; falha de JWKS → `503` com `Retry-After`, testada com JWKS fora do ar
- [ ] Timeout em todo RestClient; retry só transitório/idempotente
- [ ] `@RestControllerAdvice` único → `ProblemDetail` com `type` (categoria), `codigoRegra`, `dadosApoio`, `errors[{ field, message }]` e `traceId`; mensagem de campo do catálogo, não do Bean Validation
- [ ] Página como record plano `{ content, page, size, totalElements, totalPages }`; `size` padrão 20, máximo 100
- [ ] `versao` no corpo (`400`/`409` `conflito-versao`); `PATCH` aceita `application/json` e `application/merge-patch+json`
