# Arquitetura — Backend Java / Spring Boot

> Materialização dos princípios de [`_shared/architecture-principles.md`](../../_shared/architecture-principles.md)
> em Java 25 + Spring Boot. Unifica os antigos `architecture.md` e `GUIDELINE_ARCHITECTURE.md`.

## 1. Padrão

**Screaming Architecture** (variação domain-driven): a intenção do negócio domina a árvore de
pastas. Cada domínio isolado sob `internal/<dominio>`.

## 2. Estrutura de pastas

```
src/main/java/br/com/banestes/<app>/
├── config/                        # Config global do Spring (Security, Jackson, OpenAPI, beans)
├── integrations/                  # Clientes de APIs externas — isolados por API
│   └── <nome-da-api>/
│       ├── <NomeApi>Client.java   # Chamada (RestClient)
│       ├── <NomeApi>Config.java   # Base URL, timeouts
│       ├── <NomeApi>Settings.java # @ConfigurationProperties da API
│       └── models/                # DTOs exclusivos desta integração (sem reuso com domínios)
├── internal/                      # Coração da aplicação — domínios de negócio
│   ├── core/                      # Compartilhado entre domínios (exceptions base, enums genéricos)
│   └── <dominio>/                 # Ex: extrato, pessoa, remessa, cep
│       ├── controller/            # Entrada REST — sem regra de negócio
│       ├── service/               # 100% da regra de negócio
│       ├── model/                 # Records de request/response
│       │   └── dto/               # Sub-DTOs quando necessário
│       ├── repository/            # Interfaces Spring Data JPA
│       │   └── entity/            # Entidades JPA — nunca expostas ao controller
│       └── exception/             # Exceções específicas do domínio
└── util/                          # Java puro, sem Spring, reutilizável

src/main/resources/db/migration/   # Scripts Flyway — V<ANO><MES><DIA><HORA>__descricao.sql

src/test/java/br/com/banestes/<app>/
├── config/                        # GlobalTestConfig etc.
└── internal/<dominio>/{controller,service,repository}/

src/test/resources/wiremock/<nome-da-api>/mappings/   # JSONs de resposta para WireMock
```

## 3. Regras de dependência

| Camada | Pode importar | Não pode importar |
|---|---|---|
| `controller` | `service`, `model` | `repository`, `entity`, `integrations` diretamente |
| `service` | `repository`, `model`, `integrations`, `internal/core` | `controller` |
| `repository` | `entity` | `service`, `controller`, `model` |
| `entity` | nada interno | qualquer outra camada |
| `integrations` | seus `models` | `internal/<dominio>` (sem acoplamento bidirecional) |
| `config` | qualquer camada | — |

**Regra crítica:** uma `entity` JPA **jamais** é retornada pelo controller. O mapeamento
entity → DTO ocorre **dentro do service**.

## 4. Papéis por camada

- **Controller** — recebe request, valida input básico (`@Valid`), chama o service, devolve
  objeto de `model`. Sem `if` de negócio, sem acesso a repository.
- **Service** — única camada com regra de negócio; orquestra repository + integrations;
  faz o mapeamento entity ↔ model. Métodos com nome de ação de negócio.
- **Model** — `record` imutável para request/response/projeção.
- **Repository / Entity** — Spring Data JPA; entity mapeia tabela e não sai da camada.
- **Exception** — negócio: `internal/core/` (compartilhada) ou `internal/<dominio>/exception/`.
  A exceção de negócio carrega um código do enum `RN-XXX-NN` (que dá o status HTTP) e os
  `dadosApoio` opcionais ([`coding-standards.md`](coding-standards.md), Tratamento de erros); o
  `@RestControllerAdvice` só traduz.

## 5. Padrões táticos

- **Records Java 25** — obrigatório para todo DTO (`model/`, `model/dto/`, `integrations/<api>/models/`).
- **Tipos que o repositório recebe** (filtro, ordenação, paginação) são tipos do Spring Data (`Sort`,
  `Pageable`, `Specification`) ou records em `repository/` — nunca de `model/` nem de `service/`, que
  o repositório não pode importar (§3). O service converte o que veio do controller.
- **Regra de domínio usada por serviço e por consulta** (ex.: situação derivada de datas) fica na
  `entity` (que não importa nada interno) e é usada pelos dois, sem reescrita.
- **`PATCH` (JSON Merge Patch)** — único input que não chega como record: o controller (que aceita
  `application/json` e `application/merge-patch+json`) recebe o documento JSON (`JsonNode`), o service
  o mescla sobre o record atual, confere a `versao` do corpo e roda a Bean Validation (`Validator`) no
  record resultante antes de persistir. Campo omitido não muda; `null` apaga
  (ver [`_shared/api-standards.md`](../../_shared/api-standards.md) §4).
- **Página** — a resposta paginada é um record plano `{ content, page, size, totalElements,
  totalPages }` montado no service a partir do `Page` do repositório, que não sai da camada
  (a `entity` já é mapeada para DTO dentro do service).
- **Constructor injection** — campos `final`, sem `@Autowired` em campo.
- **`@ConfigurationProperties(prefix = "...")`** — agrupamento tipo-safe de config; validado no startup.
- **`@RestControllerAdvice`** global em `config/` retornando `ProblemDetail` (RFC 9457, ex-7807),
  com `type` (URN da categoria), `codigoRegra` e `dadosApoio` da exceção de negócio e
  `errors[{ field, message }]` na validação (ver [`_shared/api-standards.md`](../../_shared/api-standards.md) §3).
- **Versionamento de rota** — prefixo `/v1` no `@RequestMapping` (ver `_shared/api-standards.md` §1).
- **Logging** — `@Slf4j`, níveis conforme [`_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md).

## 6. Uso pela IA (protocolo)

- "Crie o domínio `produto` seguindo `backend/java/architecture.md`: entities em
  `internal/produto/repository/entity`, records em `internal/produto/model`, regra no service."
- Revisão: "Verifique se alguma entity está vazando para o controller ou se há regra de
  negócio fora do service."

## Checklist

- [ ] Domínio isolado sob `internal/<dominio>` com as subpastas padrão
- [ ] Nenhuma entity retornada pelo controller; mapeamento no service
- [ ] Regras de dependência entre camadas respeitadas
- [ ] Records para todos os DTOs; constructor injection com `final`
- [ ] `PATCH` mesclado no service e validado sobre o record resultante
- [ ] `@ConfigurationProperties` para config; `@RestControllerAdvice` + `ProblemDetail`; exceção de negócio com enum de códigos `RN-XXX-NN`
- [ ] Página como record plano montado no service; `PATCH` confere `versao`
- [ ] Rota versionada `/v1`; integrações isoladas em `integrations/<api>/`
