# FastAPI — Convenções

> Condicional da coleção. Materializa [`../../_shared/api-standards.md`](../../_shared/api-standards.md)
> e [`../../_shared/api-security.md`](../../_shared/api-security.md) na borda HTTP.

## 1. Organização das rotas

- Um `APIRouter` por domínio, em `<dominio>/api.py`, montado em `main.py` com prefixo versionado:
  `app.include_router(runs.router, prefix="/v1/runs", tags=["runs"])`.
- Versionamento no caminho, conforme o transversal §1. Sem versão em header, sem versão em query.
- `response_model` declarado em **toda** rota — é ele que garante que entidade não vaze.
- `status_code` explícito: `201` com `Location` na criação, `202` para execução assíncrona,
  `204` sem corpo na exclusão. Ver transversal §2.
- `operation_id` estável e explícito por rota — o cliente gerado depende dele.

## 2. Rota magra

A rota faz três coisas: recebe o modelo validado, chama o serviço, devolve o modelo de resposta.
Qualquer `if` de regra de negócio dentro de `api.py` é falha de review. Validação de **formato** é
do pydantic; validação de **regra** é do serviço.

## 3. Injeção de dependência

- `Depends` só em `api.py`. Provedores em `<dominio>/deps.py`, devolvendo instâncias construídas
  com suas dependências — o serviço não sabe que FastAPI existe.
- Recurso de ciclo longo (pool do banco, cliente Docker, cliente Temporal) é criado no `lifespan`
  e guardado em `app.state`. Nunca em variável global de módulo.
- Dependência de autorização é declarada na rota (ou no router), nunca verificada dentro do serviço
  por engano — autorização é da borda, autoridade de domínio é do serviço.

## 4. Erro

- Um `@app.exception_handler(DomainError)` traduz erro de negócio para **Problem Details
  RFC 7807/9457** (transversal §3), com `type`, `title`, `status`, `detail`, `instance` e
  `correlationId`.
- Handler de `RequestValidationError` também devolve Problem Details — não o formato padrão do
  FastAPI, que quebra o contrato de erro.
- `HTTPException` cru é permitido apenas na borda para casos puramente protocolares (404 de rota
  inexistente). Regra de negócio jamais levanta `HTTPException`.
- Handler de `Exception` genérico devolve `500` com `correlationId` e **sem** detalhe interno;
  o detalhe vai para o log.

## 5. Segurança

- Autenticação por dependência global; rota pública é **exceção explícita** e listada, nunca o
  default. Modelo de identidade conforme [`../../_shared/api-security.md`](../../_shared/api-security.md) §1.
- Autorização por escopo/role na dependência da rota; o serviço valida a autoridade sobre o
  recurso (o token diz quem é, não diz que aquele run é dele).
- `extra="forbid"` em todo modelo de request — campo desconhecido é rejeitado, não ignorado.
- Limites explícitos: tamanho máximo de corpo, de upload de artefato e rate limit por identidade.
- CORS restrito por origem declarada em `Settings`. `allow_origins=["*"]` é proibido.
- Endurecimento conforme transversal §4: sem stack trace na resposta, sem header revelando
  servidor/versão, `TrustedHostMiddleware` ativo.

## 6. Middlewares (ordem importa)

1. `correlationId` — gera ou propaga `X-Correlation-Id`, popula `contextvars` e o structlog.
2. Tracing OpenTelemetry.
3. `TrustedHost` / CORS.
4. Rate limit.
5. Log de acesso estruturado (sem corpo, sem header de autorização).

## 7. Execução assíncrona

- Rota que dispara execução de fluxo responde `202` com o identificador e o caminho de
  acompanhamento. **Nunca** bloqueia esperando o Temporal.
- Acompanhamento por `GET /v1/runs/{id}` e por stream de eventos (SSE) em
  `GET /v1/runs/{id}/events`. WebSocket só se houver necessidade bidirecional real.
- Endpoint de saúde separado: `/health/live` (processo vivo) e `/health/ready` (banco, Temporal e
  Docker alcançáveis). `ready` que só devolve `200` fixo é decorativo.

---

## Checklist

- [ ] Router por domínio, prefixo versionado, `operation_id` estável
- [ ] `response_model` e `status_code` explícitos em toda rota
- [ ] Nenhuma regra de negócio em `api.py`
- [ ] `Depends` só na borda; recursos de ciclo longo no `lifespan`
- [ ] Erros traduzidos para Problem Details, inclusive validação
- [ ] Autenticação por default; rota pública explicitamente listada
- [ ] `extra="forbid"`, limites de tamanho e rate limit ativos
- [ ] CORS restrito; sem stack trace ou header revelador na resposta
- [ ] Middleware de `correlationId` antes dos demais
- [ ] Disparo de fluxo responde `202`; `/health/ready` verifica dependências reais
