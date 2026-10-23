# Padrões de API HTTP (transversal)

> Regras de contrato HTTP válidas para qualquer API do workspace, independente da stack.
> Autenticação e autorização: ver [`api-security.md`](api-security.md).

## 1. Versionamento

### Versionamento da API (exposição)

- Versão **major** no path: `/v1/...`, `/v2/...`. Sem versão em header ou query string.
- Uma nova major só é criada em **breaking change** de contrato (remoção/renome de campo,
  mudança de tipo, mudança de semântica de status, remoção de endpoint).
- Adições retrocompatíveis (campo opcional novo, novo endpoint, novo valor de enum tolerado
  pelo cliente) **não** geram nova major.
- Versões antigas ficam em depreciação anunciada (header `Deprecation` + `Sunset`) por um
  período mínimo acordado com os consumidores antes de serem removidas.

### Versionamento do artefato (SemVer 2.0.0)

O número de versão do serviço/lib segue **`MAJOR.MINOR.PATCH`**:

| Incremento | Quando |
|---|---|
| `MAJOR` | Mudança incompatível de contrato público (API HTTP, assinatura de lib) |
| `MINOR` | Funcionalidade nova retrocompatível |
| `PATCH` | Correção de bug retrocompatível |

- Pré-lançamento: `1.4.0-rc.1`. Build metadata: `+20260901`.
- `0.y.z` = instável; qualquer coisa pode mudar.
- A versão da API HTTP (`/v1`) e a versão SemVer do artefato são independentes:
  o artefato pode ir de `1.x` a `2.x` sem mudar `/v1` se o contrato HTTP não quebrou.

## 2. Códigos de status HTTP

### Sucesso

| Código | Uso |
|---|---|
| `200 OK` | GET com corpo; PUT/PATCH que retorna o recurso atualizado |
| `201 Created` | POST que cria recurso — incluir header `Location` relativo (`/v1/<recurso>/{id}`), o mesmo valor devolvido no reenvio idempotente |
| `202 Accepted` | Processamento assíncrono aceito, ainda não concluído |
| `204 No Content` | DELETE com sucesso; PUT/PATCH sem corpo de resposta |

### Erro do cliente (4xx)

| Código | Uso |
|---|---|
| `400 Bad Request` | Sintaxe/JSON inválido, parâmetro malformado, formato de campo inválido, incoerência entre campos do mesmo payload |
| `401 Unauthorized` | Token ausente, inválido ou expirado |
| `403 Forbidden` | Autenticado, mas sem permissão para o recurso/ação |
| `404 Not Found` | Recurso inexistente (ou oculto por falta de permissão, quando não se quer revelar existência) |
| `405 Method Not Allowed` | Método HTTP não suportado pela rota |
| `409 Conflict` | Conflito com o **estado já gravado**: duplicidade, sobreposição com outro registro, versão desatualizada (`versao` divergente no corpo; `If-Match` como alternativa, §4) |
| `410 Gone` | Recurso/endpoint removido permanentemente |
| `413 Payload Too Large` | Corpo acima do limite de tamanho da rota (ver [`api-security.md`](api-security.md) §4) |
| `415 Unsupported Media Type` | `Content-Type` não suportado |
| `422 Unprocessable Entity` | JSON válido e bem formado, mas a regra de negócio é violada pelo estado atual do recurso (alteração proibida, transição inválida); também `Idempotency-Key` repetida com corpo diferente (§4) |
| `429 Too Many Requests` | Rate limit — incluir `Retry-After` |

### Erro do servidor (5xx)

| Código | Uso |
|---|---|
| `500 Internal Server Error` | Falha inesperada não tratada |
| `502 Bad Gateway` | Resposta inválida de sistema a montante |
| `503 Service Unavailable` | Indisponibilidade temporária / dependência fora, inclusive o banco de dados — incluir `Retry-After` |
| `504 Gateway Timeout` | Timeout em integração a montante |

**Regra:** validação de formato e de coerência entre campos do mesmo payload (ex.: fim antes do
início) → `400`; regra que depende do estado já gravado → `409` quando a requisição **conflita com
o que já está gravado** (duplicidade, sobreposição com outro registro, versão desatualizada) e `422`
quando o estado atual **proíbe a operação** (alteração proibida, transição inválida), sem escolha
entre os dois; falha de permissão → `403` (com autorização deny-by-default, rota não mapeada é
negada — `401`/`403` — antes de existir `404` ou `405`; esses só valem para rotas declaradas)
(nunca `200` com corpo de erro).

O formato e a classificação de erro desta página valem para as respostas **do serviço**. Respostas
geradas pela borda (`405`, `413` e `429` do gateway, erro de TLS) seguem o formato do gateway
corporativo e não entram nas metas de "100% dos erros classificados" da especificação.

## 3. Corpo de erro — Problem Details (RFC 9457 / 7807)

Toda resposta de erro do serviço usa `Content-Type: application/problem+json`. Membro ausente é
**omitido**, nunca devolvido como `null`.

| Membro | Uso |
|---|---|
| `type` | URN estável por **categoria** de erro: `urn:<sistema>:erro:<categoria>` (não é URL a seguir) |
| `title` | Texto fixo da categoria (o mesmo para todo erro dela) |
| `status` | O mesmo código HTTP da resposta |
| `detail` | Texto da ocorrência em português, **escrito para exibição**: sem dado técnico, sem dado pessoal, sem stack, SQL ou host interno |
| `instance` | Path da requisição, sem query string |
| `traceId` | O mesmo valor do header `X-Correlation-Id` (ver [`logging-and-levels.md`](logging-and-levels.md)) |
| `codigoRegra` | String `RN-XXX-NN`, **só** em violação de regra de negócio. Identifica a regra e o texto do catálogo do consumidor; o status HTTP da regra vem do código |
| `dadosApoio` | Objeto livre com valores de apoio ao texto (limite, número, intervalo), **só se não vazio**. As chaves são documentadas pela API por `codigoRegra`; sem dado sensível nem pessoal |
| `errors` | **Só no `400` de validação**: `[{ "field", "message" }]`. `field` é o caminho aninhado do campo (`itens[0].valor`), `corpo` (o corpo como um todo), o nome do parâmetro ou o nome do cabeçalho; `message` em português, sem dado pessoal |

- Categorias de referência (cada sistema pode acrescentar a sua, sempre estável e documentada):

  | Categoria | Status |
  |---|---|
  | `validacao` | `400` |
  | `nao-autenticado` | `401` (com `WWW-Authenticate: Bearer`) |
  | `acesso-negado` | `403` |
  | `nao-encontrado` | `404` |
  | `conflito-versao` | `409` (`versao` divergente, §4) |
  | `regra-negocio` | `409` ou `422`, conforme o `codigoRegra` e o critério do §2 |
  | `idempotencia-corpo-diferente` | `422` (§4) |
  | `indisponivel` | `503` (com `Retry-After`) |
  | `tempo-esgotado` | `504` |
  | `erro-interno` | `500` |

- `codigoRegra` é o identificador que o consumidor usa para decidir o tratamento e o texto. É
  estável: o código de uma regra não é reaproveitado para outra.
- `code` por campo em `errors[]` é **SHOULD**, aditivo e estável: evita que o cliente leia o texto
  de `message` com expressão regular. Quando existir, o consumidor prefere `code` a `message`.
- A `message` de campo vem do **catálogo de mensagens da API**, nunca do texto padrão do Bean
  Validation (ou equivalente da stack): o padrão muda com a versão e o idioma da biblioteca.
- O consumidor visual resolve o texto exibido nesta ordem: (1) catálogo da aplicação por
  `codigoRegra`; (2) sem entrada, catálogo por categoria (`type`/`status`); (3) sem catálogo, o
  `detail`. Erro de campo mostra a `message` junto do campo. Extensão desconhecida não é lida. Nunca
  se exibe stack nem corpo cru.

Violação de regra de negócio (`409` por duplicidade, com o status vindo do `codigoRegra`):

```
{
  "type": "urn:eleicoes:erro:regra-negocio",
  "title": "Regra de negócio violada",
  "status": 409,
  "detail": "Já existe urna ativa com o número 12 nesta eleição.",
  "instance": "/v1/urnas",
  "traceId": "b7f3a1c2d4e5",
  "codigoRegra": "RN-URN-01",
  "dadosApoio": { "numero": 12 }
}
```

Validação de formato (`400`, o único com `errors`):

```
{
  "type": "urn:eleicoes:erro:validacao",
  "title": "Dados inválidos",
  "status": 400,
  "detail": "Há campos inválidos na requisição.",
  "instance": "/v1/urnas",
  "traceId": "b7f3a1c2d4e6",
  "errors": [
    { "field": "numero", "message": "Informe um número de urna maior que zero." },
    { "field": "Idempotency-Key", "message": "O cabeçalho Idempotency-Key é obrigatório." }
  ]
}
```

## 4. Convenções de contrato

- Recursos no plural, kebab-case: `/v1/ordens-pagamento`.
- Instante (data e hora) em ISO-8601 UTC (`2026-09-01T12:30:00Z`). Data sem hora (vigência,
  nascimento, vencimento) em `yyyy-MM-dd`, sem fuso; a regra de negócio diz em que fuso o "hoje" é calculado.
- Paginação **plana**, por `page` + `size`: a resposta é `{ "content": [...], "page": 0, "size": 20,
  "totalElements": 134, "totalPages": 7 }`. `page` é o número da página (0-based) e `size` o tamanho
  pedido. Parâmetros `page` e `size` (padrão `size` = 20, máximo 100); valor fora do limite → `400` no
  campo (`page` ou `size`). Com cursor, quando a especificação o exigir: `{ "content": [...],
  "nextCursor": "..." }` (sem `nextCursor` na última página).
- Filtros via query string (`?status=ATIVO`). A **ordenação é fixa por endpoint** e vem da
  especificação, não do cliente.
- Toda ordenação define a posição dos nulos (sem valor por último em ordem crescente, primeiro em
  decrescente) e desempata por um campo único (`id`): a ordem fica estável entre páginas e igual no
  banco de testes e no de produção.
- **Dado pessoal nunca na URL** (path ou query string): URL vai para log de proxy, router e
  navegador. Filtro por dado pessoal (CPF/CNPJ, nome, e-mail, telefone) vai no corpo de
  `POST /<recurso>/consultas` — leitura sem efeito colateral, responde `200` com a mesma
  página plana da listagem. Quando a consulta é paginada, `page` e `size` vão **no corpo**, junto dos
  filtros: a query string dessa rota não carrega dado pessoal. Consulta sem paginação devolve um
  objeto próprio, definido na especificação. Os filtros sem dado pessoal continuam na query string
  das listagens `GET`.
- Atualização parcial: `PATCH` com JSON Merge Patch (RFC 7396) — campo omitido não muda, `null`
  apaga. Aceita `application/json` e `application/merge-patch+json`. A validação vale para o recurso
  resultante da mescla.
- Concorrência otimista: o recurso expõe `versao` (inteiro) e quem altera devolve a `versao` lida **no
  corpo**. `versao` ausente → `400` no campo `versao`; divergente do gravado → `409` com a categoria
  `conflito-versao`. `If-Match` é alternativa admitida.
- Campos monetários: valor inteiro em centavos **ou** string decimal com escala fixa — nunca `float`.
- Nomes de campo em `camelCase` no JSON.
- Idempotência: POST que cria registro aceita o header `Idempotency-Key`, no formato
  `[A-Za-z0-9._:-]{1,128}`, com validade de 24 h ([`nonfunctional-defaults.md`](nonfunctional-defaults.md)).
  É obrigatório **só onde a especificação diz**; ausente nesses casos → `400` no campo
  `Idempotency-Key`. A chave vale por operador (ou client): a mesma chave de outra pessoa é outra
  solicitação. Mesma chave com corpo diferente → `422` com a categoria `idempotencia-corpo-diferente`;
  mesma chave e mesmo corpo → o mesmo status e o mesmo `Location`, com a resposta relida do estado
  atual do recurso. O reenvio é resolvido **antes** das regras que dependem de tempo ou de estado (uma
  data que virou "hoje" não transforma o reenvio em erro), e o envio simultâneo com a mesma chave
  recebe a mesma resposta. Só a resposta de **sucesso** é gravada: a falha não consome a chave.
  Registro fora da janela de reenvio e ainda não expurgado é substituído na mesma transação
  (apagado antes do novo): a unicidade de (operador, chave) não pode depender do expurgo.

### Contrato no planejamento

O documento de especificação técnica ou plano descreve o contrato em **tabela** — método,
caminho, campos principais de entrada e saída, códigos de resposta e permissão exigida — seguindo
as convenções desta página. Não escreve o OpenAPI (YAML/JSON) nem código à mão: o contrato
formal nasce do código (ver `backend/<stack>/openapi-swagger.md`) e o detalhe de implementação
fica para a implementação.

## 5. Headers padrão

| Header | Direção | Uso |
|---|---|---|
| `Authorization: Bearer <jwt>` | request | Token de acesso |
| `X-Correlation-Id` | request/response | Correlação ponta a ponta. Aceito do cliente só se casar com `[A-Za-z0-9-]` até 64 caracteres; ausente ou fora disso, o serviço gera um novo (evita injeção em log e estouro de coluna). O `traceId` do erro é o mesmo valor |
| `Idempotency-Key` | request | Reenvio seguro de POST que cria registro (§4) |
| `If-Match` | request | Alternativa ao `versao` no corpo para a concorrência otimista (§4) |
| `Location` | response | URI do recurso criado (`201`), **relativa**, com o prefixo versionado (`/v1/<recurso>/{id}`) |
| `Cache-Control: no-store` | response | Toda resposta da API |
| `WWW-Authenticate: Bearer` | response | `401` |
| `Retry-After` | response | `503` (e `429`, gerado na borda) |
| `Deprecation` / `Sunset` | response | Endpoint/versão em depreciação |

---

## Checklist

- [ ] Versão major no path; breaking change ⇒ nova major, não alteração da atual
- [ ] Versão do artefato segue SemVer 2.0.0
- [ ] Status codes conforme tabelas (400 formato / 409 conflito com estado gravado / 422 regra de negócio / 403 permissão)
- [ ] Erros em `application/problem+json`, membros ausentes omitidos (nunca `null`); `type` = URN da categoria (`urn:<sistema>:erro:<categoria>`), `title` fixo por categoria, `detail` em português para exibição e sem dado técnico, pessoal ou stack; `codigoRegra` (`RN-XXX-NN`) e `dadosApoio` só em regra de negócio; `errors[{ field, message }]` só no `400` de validação, com `code` por campo como SHOULD; mensagem de campo do catálogo da API, não do Bean Validation
- [ ] `traceId` igual ao `X-Correlation-Id` e correlacionado ao log; `Cache-Control: no-store` nas respostas, `WWW-Authenticate: Bearer` no `401`, `Retry-After` no `503`, `Location` relativo com `/v1`
- [ ] Instantes ISO-8601 UTC e datas sem hora em `yyyy-MM-dd`; dinheiro sem `float`; paginação plana `{ content, page, size, totalElements, totalPages }` (`page` 0-based; `size` padrão 20 e máximo 100; ordenação fixa por endpoint, com nulos e `id` definidos) ou `content` + `nextCursor`
- [ ] Nenhum dado pessoal em path ou query string; busca por dado pessoal em `POST /<recurso>/consultas`, com `page`/`size` no corpo quando paginada
- [ ] `PATCH` com JSON Merge Patch (`application/json` ou `application/merge-patch+json`), validando o recurso resultante
- [ ] Concorrência otimista por `versao` no corpo (ausente → `400`; divergente → `409` `conflito-versao`); `If-Match` só como alternativa
- [ ] `Idempotency-Key` (`[A-Za-z0-9._:-]{1,128}`, 24 h, por operador) nos POST que criam registro; corpo diferente → `422` `idempotencia-corpo-diferente`; reenvio igual → mesmo status e `Location`, só sucesso gravado
- [ ] Plano descreve o contrato em tabela, sem OpenAPI escrito à mão
