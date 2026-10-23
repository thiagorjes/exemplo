# OpenAPI / Swagger — Backend Java

SpringDoc OpenAPI. A documentação é o **contrato vivo** da aplicação.

**Code-first:** o OpenAPI é gerado do código pelo SpringDoc (`/v3/api-docs`). Plano e tarefas
descrevem o contrato em tabela (ver [`_shared/api-standards.md`](../../_shared/api-standards.md) §4)
e não mantêm um arquivo OpenAPI escrito à mão.

## Política de atualização

- Todo novo endpoint nasce com documentação OpenAPI.
- Qualquer alteração de contrato (campo em record, novo status code, mudança de URL) é
  refletida **imediatamente** nas anotações.

## Tags

`@Tag` no nível da controller, agrupando por domínio:

```java
@Tag(name = "Clientes", description = "Operações de gerenciamento de clientes")
@RestController
@RequestMapping("/v1/clientes")
public class ClienteController { ... }
```

## @Operation

```java
@Operation(summary = "Busca um cliente pelo ID",
           description = "Retorna dados cadastrais consultando a base local e a API de integração.")
@GetMapping("/{id}")
public ClienteResponse buscar(@PathVariable String id) { ... }
```

## @Schema em records

Vale para todo record **exposto na API** (request e response de controller). Records internos
(auditoria, resultado de serviço) não levam `@Schema`.

```java
public record ClienteResponse(
    @Schema(description = "ID único do cliente", example = "UUID-123") String id,
    @Schema(description = "Nome completo", example = "João Silva") String nome
) {}
```

O SpringDoc lê Bean Validation (`@NotBlank`, `@Email`, `@Min`) — use para as restrições
aparecerem na doc.

## @ApiResponses

Documentar sucesso + erros específicos de negócio. Erro genérico (500) é global.
O corpo de erro é Problem Details (RFC 9457, ex-7807 — ver [`_shared/api-standards.md`](../../_shared/api-standards.md) §3)
com `Content-Type: application/problem+json`. Entrada inválida de formato é `400`; `409` e `422` são
regras de negócio (§2 da mesma página).

**Esquema de erro:** o `ProblemDetail` do Spring guarda as extensões em `properties`, e o esquema
gerado dele não mostra `codigoRegra`, `dadosApoio` nem `errors` no nível raiz. Documente o erro com
um record de esquema próprio (ex.: `ProblemaResposta`, só para o OpenAPI, com `@Schema`) com todos os
membros do contrato: `type` (URN da categoria), `title`, `status`, `detail`, `instance`, `traceId`,
`codigoRegra` (opcional), `dadosApoio` (objeto livre, opcional) e `errors` (lista de
`{ field, message }`, opcional e só no `400`); o corpo real continua sendo o `ProblemDetail` montado
pelo advice. Membros opcionais não aparecem como `null`.

Para cada erro de negócio, a `description` cita o **`codigoRegra`** (`RN-XXX-NN`) e, com
`@ExampleObject`, o corpo traz `type`, `codigoRegra` e, quando a regra tiver, `dadosApoio` com as
chaves documentadas:

```java
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "Cliente criado"),
    @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (formato): `errors[{field, message}]`",
                 content = @Content(mediaType = "application/problem+json",
                                    schema = @Schema(implementation = ProblemaResposta.class))),
    @ApiResponse(responseCode = "409", description = "Conflito com o estado gravado: `RN-CLI-01`",
                 content = @Content(mediaType = "application/problem+json",
                                    schema = @Schema(implementation = ProblemaResposta.class),
                                    examples = @ExampleObject(value = """
                                        {"type":"urn:clientes:erro:regra-negocio",
                                         "title":"Regra de negócio violada","status":409,
                                         "detail":"Já existe cliente com o documento informado.",
                                         "instance":"/v1/clientes","traceId":"b7f3a1c2d4e5",
                                         "codigoRegra":"RN-CLI-01"}"""))),
    @ApiResponse(responseCode = "422", description = "Operação proibida pelo estado atual: `RN-CLI-02`",
                 content = @Content(mediaType = "application/problem+json",
                                    schema = @Schema(implementation = ProblemaResposta.class)))
})
```

Endpoint paginado documenta o corpo da página plana com um **record** de resposta
(`{ content, page, size, totalElements, totalPages }`, com `content` tipado, ex.:
`PaginaResposta<ClienteResponse>`), não com `Page`. Os parâmetros `page` e `size`
levam `@Parameter` com o padrão (`size` = 20) e o máximo (100), e a ordenação fixa do endpoint
consta na `description`. O `409` de versão (`conflito-versao`) e o `422` de `Idempotency-Key` com
corpo diferente (`idempotencia-corpo-diferente`) entram nas respostas dos endpoints que usam
`versao` ou `Idempotency-Key`; o `PATCH` declara `application/json` e `application/merge-patch+json`.

## Boas práticas

- `operationId` explícito quando houver geração de client.
- `@Hidden` em endpoint de controle interno.
- **Produção:** Swagger UI protegida (VPN/auth) ou desabilitada — ver
  [`_shared/api-security.md`](../../_shared/api-security.md) §4. Habilitada em `dev`/`hml`.
