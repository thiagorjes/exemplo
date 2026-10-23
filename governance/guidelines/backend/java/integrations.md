# Integrações Externas (RestClient) — Backend Java

`RestClient` do Spring Web: cliente HTTP síncrono, sem WebFlux e sem `.block()`. Substitui
`WebClient` bloqueante e `RestTemplate`.
Autenticação da chamada (token transcodificado do RH-SSO): [`_shared/api-security.md`](../../_shared/api-security.md).

**Escopo:** integrações de negócio, isto é, chamadas a outros sistemas via `RestClient` em
`integrations/<api>/`. A busca das chaves de validação de token (JWKS) que o resource server faz
não é integração: segue [`_shared/api-security.md`](../../_shared/api-security.md) §1.

## Estrutura de pastas

`src/main/java/br/com/banestes/<app>/integrations/<nome-da-api>/`:

- `<NomeApi>Client.java` — chamada
- `<NomeApi>Config.java` — bean do `RestClient` (base URL, timeouts)
- `<NomeApi>Settings.java` — `@ConfigurationProperties`
- `models/` — DTOs de request/response **exclusivos** desta API

## Configuração do RestClient (timeouts obrigatórios)

```java
@Configuration
public class ClientesApiConfig {
    @Bean
    public RestClient restClientClientes(RestClient.Builder builder, ClientesApiSettings s) {
        var http = HttpClient.newBuilder().connectTimeout(s.connectTimeout()).build();
        var factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(s.readTimeout());
        return builder
            .baseUrl(s.baseUrl())
            .requestFactory(factory)
            .build();
    }
}
```

Nunca deixar timeout default — uma API externa lenta pendura todas as threads do Spring MVC.

## Client com retry

Retry pelo suporte nativo do Spring Framework 7 (`org.springframework.resilience`), habilitado
uma vez com `@EnableResilientMethods` numa classe de `config/`.

```java
@Component
public class ClientesApiClient {
    private final RestClient restClient;

    public ClientesApiClient(RestClient restClientClientes) {
        this.restClient = restClientClientes;
    }

    @Retryable(includes = ClienteIndisponivelException.class, maxRetries = 3, delay = 2000)
    public ClienteResponse buscarCliente(String id) {
        return restClient.get()
            .uri("/clientes/{id}", id)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> { throw new ClienteIntegracaoException(...); })
            .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> { throw new ClienteIndisponivelException(...); })
            .body(ClienteResponse.class);
    }
}
```

Alternativa declarativa: interface com `@HttpExchange` (`@GetExchange("/clientes/{id}")`),
registrada com `@ImportHttpServices` e apoiada no mesmo `RestClient` configurado acima.

## Boas práticas

- **Isolamento de models:** nunca usar entity JPA nem DTO da própria API na integração.
- **`.onStatus()`** antes de `.body()` para traduzir 4xx/5xx em exceção de negócio.
- **Retry** só para falha transitória e operação idempotente; no máximo 3 novas tentativas, com
  espera fixa, filtrado por exceção (`includes`).
- **Timeout de integração** ⇒ mapear para `504`; indisponibilidade ⇒ `503` (ver `_shared/api-standards.md`).
- **Prazo total por operação:** quando a operação (ou o requisito) fixa um tempo máximo de espera,
  ele é o orçamento da operação inteira, e não o de cada chamada. O timeout de cada chamada sai do
  orçamento que sobra, chamadas independentes rodam em paralelo, o retry só acontece enquanto
  restar orçamento, e esgotado o orçamento a operação responde `504` (timeout) ou `503`
  (indisponibilidade), sem nova tentativa.
- **Nunca** chamar integração dentro de `@Transactional`.
- **Log** de requisição só em dev e sem dado sensível (ver [`_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md)).
