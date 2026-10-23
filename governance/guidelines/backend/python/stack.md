# Stack — Backend Python

> Coleção para serviços de backend em Python. Versões **fixas**; `latest` não é resposta.
> Decisões estruturais: [ADR-001](../../../../docs/decisions/ADR-001-backend-python-fastapi.md),
> [ADR-002](../../../../docs/decisions/ADR-002-temporal-motor-de-fluxo.md),
> [ADR-004](../../../../docs/decisions/ADR-004-runner-de-agente-plugavel.md).

## Runtime e linguagem

| Item | Versão | Observação |
|---|---|---|
| Python | 3.13.x | Fixado em `.python-version` e no `requires-python` do `pyproject.toml` |
| Gerenciador de pacotes | uv 0.9.x | Único. `pip`/`poetry`/`conda` não são usados; `uv.lock` commitado |
| Empacotamento | `pyproject.toml` (PEP 621) | Sem `setup.py`, sem `requirements.txt` manual |

Regra de tipagem: **todo** módulo de produção é tipado e passa em `mypy --strict`. Tipagem não é
opcional aqui — é o que substitui o compilador na detecção de contrato quebrado entre camadas.

## Framework e bibliotecas

| Biblioteca | Versão | Uso |
|---|---|---|
| `fastapi` | 0.120.x | API HTTP, injeção de dependência, OpenAPI — ver [`fastapi.md`](fastapi.md) |
| `uvicorn[standard]` | 0.38.x | Servidor ASGI |
| `pydantic` | 2.12.x | Modelos de transporte imutáveis e validação |
| `pydantic-settings` | 2.12.x | Configuração tipada validada no startup |
| `temporalio` | 1.19.x | Workflows e activities duráveis — ver [`orchestration.md`](orchestration.md) |
| `docker` | 7.1.x | SDK de execução de containers efêmeros — ver [`../../infra/docker/ephemeral-runners.md`](../../infra/docker/ephemeral-runners.md) |
| `sqlalchemy[asyncio]` | 2.0.x | Camada de dados — ver [`database.md`](database.md) |
| `alembic` | 1.16.x | Migrations |
| `asyncpg` | 0.30.x | Driver PostgreSQL assíncrono |
| `httpx` | 0.28.x | Cliente HTTP de integrações — ver [`integrations.md`](integrations.md) |
| `pyyaml` | 6.0.x | Leitura de `flow.yaml` e contratos de agente (`yaml.safe_load` sempre) |
| `jsonschema` | 4.26.x | Validação estrutural de fluxo, contrato e artefato — ver [`flow-contracts.md`](flow-contracts.md) |
| `pygit2` | 1.19.x | Clone, branch isolada, commit e diff de artefatos (libgit2; sem shell) |
| `structlog` | 25.x | Logging estruturado JSON |
| `opentelemetry-sdk` + `opentelemetry-instrumentation-fastapi` | 1.38.x | Tracing e métricas |
| `google-cloud-aiplatform` | 1.120.x | Apenas para verificação/emissão de credencial Vertex; **não** para chamar o modelo (quem chama é o runner) |

Proibido adicionar dependência para o que a stdlib já resolve (`datetime`, `pathlib`, `uuid`,
`dataclasses`, `enum`, `functools`). Ver [`../../_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md) §4.

### Bibliotecas proprietárias

| Lib | Versão | Finalidade | Origem |
|---|---|---|---|
| — | — | Nenhuma no momento | — |

> Ao introduzir a primeira, registrar aqui **e** em [`../../_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md) §2.

## Qualidade e testes

| Ferramenta | Versão | Papel |
|---|---|---|
| `ruff` | 0.14.x | Lint + format. Substitui black, isort, flake8, pyupgrade |
| `mypy` | 1.18.x | Tipagem estática em modo `strict` |
| `pytest` + `pytest-asyncio` | 8.4.x / 1.2.x | Testes — ver [`testing.md`](testing.md) |
| `pytest-cov` | 7.x | Cobertura |
| `testcontainers` | 4.x | Postgres e Temporal reais nos testes de integração |
| `pip-audit` | 2.9.x | SCA sobre `uv.lock` — política em [`../../_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md) §1 |
| `bandit` | 1.9.x | Análise estática de segurança |

## Persistência e infraestrutura

| Item | Versão | Uso |
|---|---|---|
| PostgreSQL | 18.x | Estado de fluxos, catálogo de etapas, metadados de artefato |
| Temporal Server | 1.30.x | Durabilidade, retry, timeout e replay das execuções |
| Git | Servidor Git do time | **Fonte de verdade** de fluxos, contratos e artefatos produzidos |
| Armazenamento de objetos | S3-compatível (MinIO 2026.x em dev, GCS em produção) | Só o que não pertence ao Git: log de runner, prompt/resposta brutos, binário grande |
| Docker Engine | 28.x | Execução das etapas — ver [`../../infra/docker/`](../../infra/docker/) |

## Estrutura de execução

O backend tem **dois processos distintos**, mesma base de código:

| Processo | Comando | Responsabilidade |
|---|---|---|
| API | `uvicorn app.main:app` | Exposição HTTP, autenticação, disparo e consulta de execuções |
| Worker | `python -m app.worker` | Executa workflows e activities Temporal; é quem cria os containers efêmeros |

Não misturar: a API **nunca** executa uma etapa em processo. Ela registra a intenção e retorna.

---

## Checklist

- [ ] Versões fixas no `pyproject.toml`; `uv.lock` commitado
- [ ] `mypy --strict` verde em todo módulo de produção
- [ ] Nenhuma dependência redundante com a stdlib
- [ ] Tabela de libs proprietárias sincronizada com o transversal
- [ ] API e worker permanecem processos separados
