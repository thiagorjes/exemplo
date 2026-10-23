# Stack — Backend Java

> **Stack backend padrão e obrigatória do workspace: Java 25 + Spring Boot 4.x.**
> Todo novo serviço backend nasce com esta stack. Qualquer outra (C#, Kotlin, Node…) é
> exceção e exige ADR aprovado justificando o desvio + sua própria pasta `backend/<stack>/`
> gerada pelo template.
>
> Versões "gerenciado pelo Boot" seguem o BOM do Spring Boot.

## Linguagem

| Linguagem | Versão | Uso |
|---|---|---|
| Java | 25 (LTS) | Toda a aplicação. `--release 25`. Sem preview features em produção. |

## Framework principal

| Biblioteca | Versão | Finalidade |
|---|---|---|
| Spring Boot | 4.1.x (suporte OSS até 07/2027) | MVC, DI, auto-config, actuator |
| Spring Web MVC | gerenciado pelo Boot (`spring-boot-starter-webmvc`) | API REST imperativa |
| Spring Security | gerenciado pelo Boot (7.x) | Autenticação e autorização |
| Spring Security OAuth2 Resource Server | gerenciado pelo Boot | Validação de JWT do RH-SSO (ver `_shared/api-security.md`) |
| Spring Data JPA | gerenciado pelo Boot (Hibernate 7) | Persistência |
| Spring Web `RestClient` | gerenciado pelo Boot (`spring-boot-starter-restclient`) | Cliente HTTP síncrono para integrações; `@HttpExchange` opcional (ver [`integrations.md`](integrations.md)) |
| Jackson | gerenciado pelo Boot (3.x, pacote `tools.jackson.*`) | JSON |
| Lombok | gerenciado pelo Boot | `@Slf4j`, `@Builder`, redução de boilerplate |
| SpringDoc OpenAPI | 3.1.x | Swagger UI / OpenAPI 3 |
| Flyway + módulo do banco do sistema | gerenciado pelo Boot | Migrations (ver [Banco de dados](#banco-de-dados)) |
| Apache POI | 5.x | Leitura/geração de `.xlsx` |
| Commons-net | 3.x | FTP |
| OpenPDF | `com.github.librepdf:openpdf`, fora do BOM do Boot: fixar a versão estável mais recente no `pom.xml`, com CVE verificado pelo SCA (`_shared/vulnerable-and-proprietary-libs.md`) | Geração de PDF (relatórios, atas), com criptografia de permissões (PDF não editável) |
| Micrometer Prometheus | gerenciado pelo Boot (`micrometer-registry-prometheus`) | Endpoint `prometheus` do Actuator (ver `_shared/operations-and-readiness.md`) |

## Bibliotecas proprietárias

| Lib | Versão | Finalidade |
|---|---|---|
| `banestes-token-rhsso` | 2.1.0 | Obtenção e transcode de tokens RH-SSO |

> Resolução **somente** via Nexus corporativo. Ver `_shared/vulnerable-and-proprietary-libs.md`.
>
> **Pendente:** confirmar com o time dono a versão de `banestes-token-rhsso` compatível com
> Spring Framework 7, Spring Security 7 e Jackson 3 antes do primeiro serviço em Boot 4.
> Enquanto a compatibilidade não for confirmada, implementar o token exchange (RFC 8693) por
> `RestClient` atrás de uma interface é **exceção válida**, registrada em ADR com prazo e condição de
> saída (trocar pela lib quando houver versão compatível). A tabela fica como registro da lib, não
> como inventário de uso.

## Exceção: BFF de SPA em Java

O BFF de SPA **em Java** (Spring Cloud Gateway com `TokenRelay`, ver
`frontend/_shared/spa-bff.md`) depende do Spring Cloud.
O trilho do Boot 4.1 (Spring Cloud 2026.0) ainda não é GA: até lá, o BFF em Java usa Spring Boot
4.0.x com Spring Cloud 2025.1.x. Os demais serviços não usam Spring Cloud.

A alternativa é o BFF Node standalone, que não usa esta stack: cumpre o contrato mínimo de
`frontend/_shared/spa-bff.md` (seção "BFF que não é Spring Cloud Gateway: contrato mínimo") e, por
ser desvio da stack padrão, é registrado em ADR (esse contrato dispensa uma pasta
`backend/<stack>/` própria para o BFF).

## Banco de dados

**PostgreSQL é o padrão.** MySQL ou Oracle só quando a demanda declarar; outro banco exige ADR.
Detalhes de cada um em [`database.md`](database.md) §0.

| Sistema | Driver | Módulo Flyway | Uso |
|---|---|---|---|
| PostgreSQL (padrão) | `org.postgresql:postgresql` | `flyway-database-postgresql` | Produção / HML |
| MySQL | `com.mysql:mysql-connector-j` | `flyway-mysql` | Produção / HML, quando declarado |
| Oracle | `com.oracle.database.jdbc:ojdbc11` | `flyway-database-oracle` | Produção / HML, quando declarado |
| H2 | gerenciado pelo Boot | — | Testes e perfil local, em modo de compatibilidade com o banco do sistema. Escopo `test` (e perfil Maven `local`); nada de H2 nem de código específico de H2 no artefato de produção |

Versões de driver e módulos gerenciadas pelo Boot. Só o banco do sistema entra no `pom.xml`.

> **H2 e o BOM do Boot.** Com o Boot 4.1.1 o H2 do BOM (2.4.240) falhou ao inserir em tabela com
> `CHECK` criada pelo Flyway (visto em `MODE=PostgreSQL`; sem reprodutor anexado, causa não isolada).
> Enquanto o BOM não for corrigido, o projeto pode fixar `h2.version` em **2.3.232**, a maior que o
> Flyway 12 reconhece como verificada, só em `test` e no perfil local, e revalida a cada troca de
> Boot. Antes de fixar, confira se a versão passa na política de CVE
> ([`_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md)).
> A nota vale enquanto o H2 for o banco dos testes de repositório; MySQL e Oracle não foram
> verificados.

## Build e qualidade

| Ferramenta | Versão | Finalidade |
|---|---|---|
| Maven (wrapper) | — | Build, testes, empacotamento |
| JaCoCo | 0.8.15+ (suporte a Java 25) | Cobertura |
| SonarQube Maven Plugin | 3.11.x | Análise estática (perfil `Banestes_way`) |
| `flyway-maven-plugin` | 6.5.7 (a do Flyway da esteira) | Migração no passo "Migrar BD" da esteira (ver [`database.md`](database.md) §1) |
| OWASP Dependency-Check ou scanner corporativo | — | SCA de CVEs (ver `_shared/vulnerable-and-proprietary-libs.md`) |

## Testes

| Ferramenta | Uso |
|---|---|
| JUnit 6 (Jupiter) | Framework de testes (gerenciado pelo Boot) |
| Mockito | Mocks de service |
| MockMvc | Testes de controller sem servidor (`spring-boot-starter-webmvc-test`) |
| Spring Security Test | Contexto de segurança em teste |
| WireMock (`org.wiremock.integrations:wiremock-spring-boot` 4.x) | Mock de APIs externas |
| H2 | Repositório em memória (`@DataJpaTest`, `spring-boot-starter-data-jpa-test`) |

## Infraestrutura

- **Plataforma:** OpenShift Container Platform (OCP4 — `ioc.bcloud.sfb`)
- **Artefatos:** Nexus `nexus3-cicd-tools.cloud.sfb` (releases e snapshots)
- **CI/CD:** Pipeline OCP4 com SonarQube e SCA integrados; migração de banco no passo "Migrar BD"
  (Jenkins, `AUTOMATIZA_BD=Y`)
- **SonarQube:** `sonarqube.apps.ioc.bcloud.sfb` — Quality Profile `Banestes_way`
