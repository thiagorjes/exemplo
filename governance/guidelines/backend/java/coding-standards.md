# Padrões de Código — Backend Java

> Convenções de commit: ver [`_shared/git-workflow.md`](../../_shared/git-workflow.md).
> Níveis de log: ver [`_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md).

## Nomenclatura

| Artefato | Convenção | Exemplo |
|---|---|---|
| Classes | PascalCase | `ExtratoService`, `ClienteRequest` |
| Métodos / variáveis | camelCase | `buscarExtratoPorConta`, `valorTotal` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Packages | lowercase (underscore só se necessário) | `extrato`, `gud_api` |
| Arquivos Java | PascalCase | `ExtratoController.java` |
| Migrations Flyway | `V<ANO><MES><DIA><HORA>__descricao_clara.sql` | `V202411221030__create_table_clientes.sql` |
| Mocks WireMock | `<metodo>-<recurso>-<status>.json` | `get-address-200.json` |

## Injeção de dependência

Exclusivamente **constructor injection** com campos `final`. `@Autowired` em campo é proibido.
Com um único construtor, o `@Autowired` no construtor é opcional (Spring 6+). Garante
imutabilidade e expõe dependências circulares.

## DTOs e imutabilidade

**Java Records** para todo objeto de transporte (DTO, request, response, projeção).
Proibido classe com getter/setter para DTO.

```java
public record ExtratoRequest(
    @NotBlank String numeroConta,
    @NotNull LocalDate dataInicio,
    @NotNull LocalDate dataFim
) {}
```

## Tratamento de erros

- Exceção de negócio = classe customizada nomeada; nunca `throw new RuntimeException("...")`.
- A exceção de negócio carrega um **enum de códigos de regra** (`RN-XXX-NN`, ex.: `RN-URN-01`), que
  também traz o **status HTTP** da regra e o `title`/categoria quando couber. O código vem do enum,
  não de texto livre; kebab-case deixa de ser exigido. Opcionalmente carrega `dadosApoio` (mapa de
  valores de apoio ao texto do consumidor, com as chaves documentadas por código, sem dado sensível
  ou pessoal). O texto do `detail` é em português, escrito para exibição, sem dado técnico nem
  pessoal; a mensagem técnica da exceção serve só ao log.
- `catch` vazio ou com só `printStackTrace()` é proibido (o perfil Sonar não pega o
  `printStackTrace`: revisão ou `grep`). Logar **ou** relançar a mesma exceção, não os dois (S2139):
  quem registra a exceção de negócio é o handler global.
- `@RestControllerAdvice` global em `config/` retorna `ProblemDetail` (RFC 9457, ex-7807), com
  `Content-Type: application/problem+json`, e o preenche a partir da exceção: `type` (URN da
  categoria, `urn:<sistema>:erro:<categoria>`), `title` (fixo da categoria), `status`, `detail`,
  `instance` (path sem query), `traceId` (o do `X-Correlation-Id`), `codigoRegra` (o do enum),
  `dadosApoio` (só se não vazio) e `errors[{ field, message }]` (só no `400` de validação).
  Membro ausente é omitido, nunca `null`. Formato do corpo em
  [`_shared/api-standards.md`](../../_shared/api-standards.md) §3.
- A `message` de cada campo em `errors[]` vem de `mensagens.properties` (ou catálogo equivalente da
  API), por código estável da constraint; **nunca** do texto padrão do Bean Validation.
- Mapa exceção → status (critério em [`_shared/api-standards.md`](../../_shared/api-standards.md) §2):
  formato inválido ou incoerência entre campos → `400`; recurso inexistente → `404`; conflito com o
  estado já gravado (duplicidade, sobreposição, versão desatualizada) → `409`; estado atual proíbe a
  operação (alteração proibida, transição inválida) → `422`; falta de permissão → `403`. O status
  da exceção de negócio vem do enum de códigos (cada regra declara o seu); o advice só traduz.

```java
throw new RegraNegocioException(CodigoRegra.RN_URN_01, Map.of("numero", numero)); // RN-URN-01, dadosApoio {numero}, status 409 do enum
```

## Logging

`@Slf4j` do Lombok. `System.out`/`System.err` proibidos (Sonar S106). Mensagem parametrizada,
sem concatenar valores. Níveis e dados proibidos em log: [`_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md).

## Complexidade cognitiva

Meta de **≤ 15** por método (Sonar S3776). O perfil do servidor só acusa acima de **30**
(`Threshold=30`), então os 15 são cobrados na revisão. Acima de 15, extrair métodos privados com
nome de ação de negócio. Demais limites do perfil (7 parâmetros, 3 literais repetidos, nomes sem
`_`): [`sonarqube.md`](sonarqube.md).

## Comentários

Zero comentário explicando **o quê**. Comente só o **porquê** quando não for óbvio.

## Supressão de alertas Sonar

Proibido `@SuppressWarnings("squid:...")` e `// NOSONAR`. Corrigir estruturalmente.

## Checklist

- [ ] Nomenclatura conforme tabela
- [ ] Constructor injection com `final`; sem `@Autowired` em campo
- [ ] Records para todos os DTOs
- [ ] Exceções de negócio nomeadas, com enum de códigos `RN-XXX-NN` (status no enum) e `dadosApoio` opcional; sem `catch` vazio; handler global + `ProblemDetail` com `type` (categoria), `codigoRegra`, `dadosApoio`, `errors[{ field, message }]` e `traceId`; mensagem de campo do catálogo, não do Bean Validation
- [ ] `@Slf4j`; sem `System.out`; mensagem parametrizada
- [ ] Complexidade cognitiva ≤ 15 (meta; o servidor acusa > 30)
- [ ] Sem `// NOSONAR` / `@SuppressWarnings`
