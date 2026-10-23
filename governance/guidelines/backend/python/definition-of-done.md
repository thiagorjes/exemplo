# Definition of Done — Backend Python

> Materializa [`../../_shared/api-standards.md`](../../_shared/api-standards.md),
> [`../../_shared/api-security.md`](../../_shared/api-security.md) e
> [`../../_shared/vulnerable-and-proprietary-libs.md`](../../_shared/vulnerable-and-proprietary-libs.md).
> Só entra aqui o que é **verificável** — por comando ou por revisor humano nomeado.

## 1. Obrigatórios (bloqueiam o merge)

| Critério | Verificador |
|---|---|
| Formatação e lint limpos | `ruff format --check . && ruff check .` |
| Tipagem estrita verde | `mypy --strict app` |
| Testes verdes, incluindo marcados `docker` | `pytest -m "not external"` |
| Cobertura dentro das metas de [`testing.md`](testing.md) §6 | `pytest --cov=app --cov-fail-under=85` |
| Sem CVE Critical/High sem waiver | `pip-audit --strict` |
| Sem achado de segurança de severidade alta | `bandit -r app -ll` |
| `uv.lock` commitado e coerente com o `pyproject.toml` | `uv lock --check` |
| Versões fixas; nenhum range aberto, nenhum `latest` | `uv lock --check` + revisor |
| Migrations sobem e descem contra banco real | `pytest tests/integration/test_migrations.py` |
| OpenAPI gerado e diff revisado | [`openapi.md`](openapi.md) — `pytest tests/contract/test_openapi_snapshot.py` |
| Contrato HTTP conforme o transversal (status, Problem Details, headers) | Revisor humano + testes de API |
| Toda rota autenticada e autorizada; negação testada | Revisor humano + testes |
| Nenhum segredo no diff | `gitleaks detect --no-banner` no pré-commit e no CI |
| Varredura de segredo sobre `out/` e sobre a branch da execução **antes** do commit; achado falha a etapa | `pytest tests/integration/test_commit_segredo.py` |
| Contrato não amplia `network`/`mcp`/`limits` acima do teto do servidor | `pytest` — [`flow-contracts.md`](flow-contracts.md) §8 |
| `repo/` gravável nunca é o repositório do framework | `pytest` — [`flow-contracts.md`](flow-contracts.md) §9 |
| Log sem dado proibido; conteúdo de agente mascarado | Revisor humano |
| Etapa nova com timeout e teto de custo declarados | Revisor humano — [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §6 |
| Activity nova é idempotente e tem teste que prova | Revisor humano + teste |
| Workflow sem I/O, relógio ou aleatoriedade | `pytest` de replay + revisor |
| Commit no formato Conventional Commits | `commitlint` no CI |
| Decisão estrutural registrada como DR em `docs/decisions/` | Revisor humano |

## 2. Recomendados (não bloqueiam, viram dívida nomeada)

- Métrica e span novos para o caminho adicionado (ver [`observability.md`](observability.md)).
- Ponto de extensão documentado quando a mudança introduz uma nova fronteira.
- Teste de carga do caminho quando a mudança altera concorrência de etapas.
- Remoção de código morto detectado junto com a mudança.

## 3. Checklist de code review

Segurança e contrato primeiro — o resto o CI já pegou:

- [ ] Entidade de banco não cruza a camada de entrada
- [ ] Nenhum import cruzado entre domínios
- [ ] Efeito colateral está em activity, não em workflow
- [ ] Idempotência garantida por chave, não por "não deve acontecer duas vezes"
- [ ] Entrada validada na borda; saída de agente tratada como não confiável
- [ ] Caminho de artefato validado contra travessia de diretório
- [ ] Credencial com escopo mínimo, injetada em tempo de execução, fora de imagem/bundle/log
- [ ] Timeout explícito em toda chamada de rede e em toda etapa
- [ ] Erro de negócio nomeado e mapeado; sem `except` genérico silencioso
- [ ] Log estruturado, mascarado, com `correlationId`
- [ ] Nomes de função descrevem ação de negócio
- [ ] Teste afirma comportamento, não cobre linha
- [ ] Nenhuma supressão de alerta sem código de regra e justificativa
