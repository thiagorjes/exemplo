# Integrações Externas — Backend Python

> Condicional da coleção. Cliente HTTP `httpx` ([`stack.md`](stack.md)). Isolamento de fronteira:
> [`architecture.md`](architecture.md) §1. Credenciais:
> [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §5 e
> [`../../_shared/api-security.md`](../../_shared/api-security.md).

## 1. Isolamento

- Um pacote por sistema externo em `integrations/<sistema>/`, com `client.py`, `models.py` e
  `errors.py` próprios.
- Modelo da integração **nunca** vaza para o domínio. O cliente traduz para modelo de domínio na
  saída e traduz erro externo para erro nomeado de domínio.
- O domínio depende de um `Protocol` declarado por ele, não da classe do cliente. Trocar o
  fornecedor externo não deve tocar em nenhum arquivo de domínio.
- Nenhuma integração é chamada de dentro de workflow — sempre de activity
  ([`orchestration.md`](orchestration.md) §4).

## 2. Cliente HTTP

- `httpx.AsyncClient` único por integração, criado no `lifespan` e reutilizado. Criar cliente por
  requisição derruba o pool e o keep-alive.
- **Timeout explícito obrigatório**, granular: `connect`, `read`, `write`, `pool`. Default global
  do httpx não é política.
- Limites de conexão (`max_connections`, `max_keepalive_connections`) declarados em `Settings`.
- `base_url`, versão de API e `User-Agent` identificando o serviço, vindos de `Settings`.
- `X-Correlation-Id` propagado em toda chamada de saída
  ([`../../_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md) §4).
- Resposta validada em modelo pydantic da integração. `response.json()` usado direto no serviço é
  contrato não declarado.

## 3. Falha e resiliência

- Retry apenas em erro **transitório** (timeout de conexão, 429, 5xx) e apenas em operação
  idempotente. Retry cego em `POST` não idempotente duplica efeito.
- Backoff exponencial com jitter; respeitar `Retry-After` quando presente.
- Teto de tentativas e teto de tempo total declarados por integração.
- Circuit breaker em integração crítica de alta frequência; degradação declarada quando aberto.
- Erro externo nunca vaza cru para o cliente da API: traduzir para erro de domínio e mapear via
  handler global ([`fastapi.md`](fastapi.md) §4). `502`/`504` para falha do provedor,
  nunca `500` genérico.
- Quando a chamada acontece dentro de activity, preferir o retry do Temporal ao retry do cliente.
  Empilhar os dois multiplica tentativas: escolher um nível e declarar qual.

## 4. Credenciais de provedor de modelo (Vertex AI / Google)

- A aplicação **não** chama o modelo. Quem chama é o runner, dentro do container efêmero. O papel
  do backend é **emitir e injetar** a credencial com escopo mínimo e validade curta.
- Preferir identidade de carga de trabalho / conta de serviço com escopo limitado a
  `aiplatform` no projeto e região declarados. Chave de conta de serviço em arquivo é o último
  recurso, e se existir: montada em `tmpfs`, nunca em imagem, nunca em `bundle.json`, nunca em
  argumento de comando.
- Token é obtido no momento da etapa, com TTL curto, e expira antes de qualquer log ou artefato
  poder vazá-lo.
- Rotação sem rebuild de imagem e sem redeploy do orquestrador é requisito, não conveniência.
- Todo uso de credencial é auditado: run, etapa, identidade, horário.

## 5. Servidores MCP

Servidor MCP é integração externa com um agravante: quem o invoca é o modelo, não o seu código.

- MCP habilitado é decisão **da etapa**, declarada no `mcp.json` do bundle. Catálogo de servidores
  permitidos é do orquestrador; o prompt não habilita nada.
- Cada servidor MCP recebe apenas as credenciais que aquela etapa precisa
  ([`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §5).
- Servidor MCP que escreve em sistema externo exige aprovação explícita na definição do fluxo, e a
  etapa que o usa não é reexecutada automaticamente — retry de escrita externa não idempotente é
  duplicação de efeito.
- Saída de MCP é entrada não confiável, como qualquer conteúdo de contexto (transversal §8).
- Versão do servidor MCP é fixa e faz parte da proveniência da imagem
  ([`../../infra/docker/ephemeral-runners.md`](../../infra/docker/ephemeral-runners.md)).

## 6. Testes

- Integração testada contra fake da **sua** interface, não contra mock do httpx
  ([`testing.md`](testing.md) §1).
- Teste de contrato com payload real gravado (não gerado à mão) verifica que o parsing sobrevive à
  resposta verdadeira.
- Cenários obrigatórios: timeout, 429 com `Retry-After`, 5xx, payload inesperado, credencial
  expirada.

---

## Checklist

- [ ] Um pacote por sistema externo; modelos e erros isolados
- [ ] Domínio depende de `Protocol` próprio, não do cliente
- [ ] Integração chamada só de activity
- [ ] `AsyncClient` reutilizado, timeouts granulares explícitos, limites de pool declarados
- [ ] `X-Correlation-Id` propagado; resposta validada em modelo
- [ ] Retry só em transitório e idempotente; nível de retry escolhido e declarado
- [ ] Erro externo traduzido para erro de domínio; sem `500` genérico
- [ ] Credencial de modelo com escopo mínimo, TTL curto, fora de imagem/bundle/log, rotacionável
- [ ] MCP habilitado pela etapa, nunca pelo prompt; saída tratada como não confiável
- [ ] Testes cobrem timeout, 429, 5xx, payload inesperado e credencial expirada
