# Testes — Backend Java

## 1. Estratégia

| Camada | Ferramenta | Foco |
|---|---|---|
| `controller` | `MockMvc` | Contrato: request válido → response, validação campo a campo |
| `service` | `Mockito` | Regra de negócio isolada |
| `repository` | H2 (`@DataJpaTest`) | Queries e mapeamento de entidade |
| `integrations` | WireMock + JSON estático | Simulação de API externa |

## 2. Integrações externas com WireMock

Via `org.wiremock.integrations:wiremock-spring-boot` (sem Spring Cloud). Respostas nunca
hardcoded no Java. Mapeamentos JSON em `src/test/resources/wiremock/<nome-da-api>/mappings/`
(ex.: `wiremock/correios/mappings/get-address-200.json`, `get-address-404.json`).

```java
@SpringBootTest
@EnableWireMock(@ConfigureWireMock(
    name = "<nome-da-api>",
    filesUnderClasspath = "wiremock/<nome-da-api>",
    baseUrlProperties = "<app>.integrations.<nome-da-api>.base-url"))
class ExternalIntegrationTest { /* mapeamentos carregados automaticamente */ }
```

Uma pasta por API; arquivos de sucesso e de erro.

Starters de teste são por módulo no Boot 4: `spring-boot-starter-webmvc-test` (MockMvc) e
`spring-boot-starter-data-jpa-test` (`@DataJpaTest`), além de `spring-security-test`.

## 3. Controller com MockMvc

Obrigatório validar **cada campo** do JSON de resposta, não só o status.

```java
@Test
void deveRetornarSucessoAoBuscarCliente() throws Exception {
    mockMvc.perform(get("/v1/clientes/{id}", 1L).contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.nome").value("João Silva"))
        .andExpect(jsonPath("$.email").value("joao@email.com"))
        .andExpect(jsonPath("$.status").value("ATIVO"));
}
```

Erro de negócio, erro de validação e página também travam o contrato campo a campo (status, `type`
da categoria, `codigoRegra` e `dadosApoio.<chave>`; `errors[0].field` e `errors[0].message` no `400`;
`content`, `page`, `size`, `totalElements` e `totalPages`):

```java
mockMvc.perform(post("/v1/urnas").contentType(MediaType.APPLICATION_JSON).content(corpo))
    .andExpect(status().isConflict())
    .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
    .andExpect(jsonPath("$.type").value("urn:eleicoes:erro:regra-negocio"))
    .andExpect(jsonPath("$.codigoRegra").value("RN-URN-01"))
    .andExpect(jsonPath("$.dadosApoio.numero").value(12))
    .andExpect(jsonPath("$.detail").exists())
    .andExpect(jsonPath("$.traceId").exists())
    .andExpect(jsonPath("$.errors").doesNotExist());

mockMvc.perform(post("/v1/urnas").contentType(MediaType.APPLICATION_JSON).content(corpoSemNumero))
    .andExpect(status().isBadRequest())
    .andExpect(jsonPath("$.type").value("urn:eleicoes:erro:validacao"))
    .andExpect(jsonPath("$.errors[0].field").value("numero"))
    .andExpect(jsonPath("$.errors[0].message").value("Informe o número da urna."))
    .andExpect(jsonPath("$.codigoRegra").doesNotExist());

mockMvc.perform(post("/v1/urnas/consultas").contentType(MediaType.APPLICATION_JSON)
        .content("{\"page\":0,\"size\":20}"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.content").isArray())
    .andExpect(jsonPath("$.page").value(0))
    .andExpect(jsonPath("$.size").value(20))
    .andExpect(jsonPath("$.totalElements").value(1))
    .andExpect(jsonPath("$.totalPages").value(1));
```

O `400` trava o texto do catálogo da API (`mensagens.properties`), não o padrão do Bean Validation.
`versao` ausente (`400` no campo `versao`), `versao` divergente (`409`, `type` de categoria
`conflito-versao`), `Idempotency-Key` ausente onde obrigatória (`400` no campo `Idempotency-Key`) e
com corpo diferente (`422`, categoria `idempotencia-corpo-diferente`) têm teste de controller próprio.

Teste que lê `/actuator/prometheus` liga o export de métricas com `@AutoConfigureMetrics`: em
`@SpringBootTest` ele vem desligado.

Endpoints protegidos: usar `spring-security-test` (`jwt()` post-processor) para simular o token
do RH-SSO com os scopes/roles necessários.

## 4. Repository com H2

```java
@DataJpaTest
@ActiveProfiles("test")
class ClienteRepositoryTest {
    @Autowired ClienteRepository repository;

    @Test
    void devePersistirEntidade() {
        var salvo = repository.save(new ClienteEntity("Teste", "teste@email.com"));
        assertNotNull(salvo.getId());
        assertEquals("Teste", salvo.getNome());
    }
}
```

O H2 roda em modo de compatibilidade com o banco do sistema (URL no arquivo do banco, ver
[`database.md`](database.md) §0). A versão do H2 segue o BOM, salvo a nota de [`stack.md`](stack.md)
(Banco de dados).

Recurso exclusivo do banco (trigger, função, índice parcial ou por função, exclusion constraint,
comportamento de trava) não roda no H2: um teste automatizado de integração (perfil
`-P<banco>-it` — `postgresql-it`, `mysql-it` ou `oracle-it` —, fora do `verify` padrão) aplica as
migrations no banco de homologação e exercita o recurso (ex.: tentativa de violar a regra que ele
protege), em INSERT e UPDATE. Roteiro manual não substitui esse teste.

- **Schema preparado pelo próprio perfil:** o `<banco>-it` aplica as migrations de schema (Flyway)
  no schema dedicado antes de rodar; ninguém prepara esse schema à mão. O **usuário** da aplicação
  (e o papel de expurgo, se houver) é objeto do cluster, não do schema: o DBA o cria antes.
- **Privilégio só se prova no banco real:** o H2 não aplica `GRANT` nem negação de privilégio, então
  teste que passa no H2 pode falhar no banco real (ex.: edição que o JPA faz como `DELETE` e
  `INSERT` numa aplicação sem `DELETE`). O `<banco>-it` abre uma conexão **dona** (no papel do usuário
  da esteira, que aplica as migrations) e a da **aplicação** (mais a de expurgo, se houver papel
  próprio), e prova cada privilégio concedido e cada negado ([`database.md`](database.md) §1).
- **Sem carga de dados:** o schema dedicado do `<banco>-it` recebe só as migrations de schema e os
  dados do próprio teste; a `location` de carga de dados não entra nesse perfil.
- **Dados isolados:** schema dedicado ou registros com prefixo de teste, e limpeza **só do que o
  teste criou**. Nunca limpeza global num banco compartilhado: apagaria auditoria e dados de
  negócio, e registro de teste esquecido colide com carga de dados posterior.
- Roda antes de qualquer carga de dados no ambiente.
- A **evidência da execução em homologação** (resultado anexado ao PR ou à entrega) faz parte da
  Definition of Done da feature que criou o recurso. Não exige tarefa de esteira.

## 4.1 Higiene dos testes

- **Base nasce vazia:** o schema de teste é vazio → migrations → dados do próprio teste. Não se
  reaproveita base que acumulou dados de execuções anteriores.
- `@Disabled` não entra na branch principal. Teste instável é corrigido, e limite de tempo não é
  afrouxado para fazê-lo passar: um caminho frio (primeira requisição, pool de conexão) se resolve
  com aquecimento no teste.
- **Transição de estado inválida** tem teste (por combinação de origem × destino quando o conjunto é
  enumerável). Todo endpoint protegido tem teste de **autorização negativa** (sem papel → `403`),
  inclusive para leitura de dado pessoal.
- Defeito corrigido traz o teste que reproduz a falha ([`git-workflow.md`](../../_shared/git-workflow.md)).
- Falha de efeito assíncrono (notificação, integração) tem teste: o evento é gerado e o fluxo
  principal responde como a especificação diz ([`operations-and-readiness.md`](../../_shared/operations-and-readiness.md) §6).
- A imutabilidade da tabela de auditoria tem teste no banco real (ver
  [`api-security.md`](../../_shared/api-security.md) §5).
- **Sistema que substitui um legado:** o comportamento mantido é fixado por **teste de
  caracterização** antes da reescrita — entrada e saída observadas no legado, com dado anonimizado
  ([`data-protection.md`](../../_shared/data-protection.md) §3) —, e o teste só muda por decisão
  registrada.

## 5. Protocolo para a IA

1. **Asserts exaustivos** em controller/integrations — todos os campos via `jsonPath`.
2. **Simplicidade** — teste é `Envia Request → Checa Response`; sem lógica complexa no teste.
3. **Separação de mocks** — uma pasta `wiremock/<api>/mappings/` por integração, com sucesso e erro.
4. **MockMvc** sempre para endpoint de `controller`.
5. Se o JSON for grande, não ignore campos — liste todos os `jsonPath` para travar o contrato.

## Cobertura

- JaCoCo; meta geral **> 80%** (recomendado, ver [`definition-of-done.md`](definition-of-done.md)).
- Cobrir fluxo principal + casos de erro do domínio.
