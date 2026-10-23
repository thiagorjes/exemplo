# Padrões de Código — Backend Python

> Materializa [`../../_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md) e
> [`../../_shared/git-workflow.md`](../../_shared/git-workflow.md) com ferramentas concretas.
> Estrutura e camadas: [`architecture.md`](architecture.md).

## 1. Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Módulo / pacote | `snake_case`, singular quando é conceito, plural quando é coleção de domínio | `bundler.py`, `runs/` |
| Classe | `PascalCase` | `RunService`, `ClaudeCliRunner` |
| Função / método | `snake_case`, verbo de negócio | `iniciar_execucao`, não `update_status` |
| Constante | `UPPER_SNAKE_CASE` | `TIMEOUT_PADRAO_ETAPA` |
| Privado | prefixo `_` | `_montar_manifesto` |
| Modelo de transporte | sufixo `Request` / `Response` / `Dto` | `IniciarRunRequest` |
| Entidade de banco | sufixo `Entity` | `RunEntity` |
| Exceção | sufixo `Error` | `EtapaSemArtefatoError` |
| Teste | `test_<unidade>_<condição>_<resultado>` | `test_bundler_sem_skills_falha` |

Idioma: **domínio em pt_BR**, termos técnicos em inglês (`repository`, `workflow`, `runner`).
Não misturar dentro do mesmo identificador.

## 2. Tipagem

- `mypy --strict` é gate de merge. Módulo de produção sem anotação não passa.
- `Any` exige comentário justificando na mesma linha. `# type: ignore` exige código do erro
  (`# type: ignore[arg-type]`) e justificativa.
- Preferir `Protocol` a herança para contrato de fronteira.
- Tipos de domínio explícitos sobre primitivos soltos: `RunId = NewType("RunId", UUID)` em vez de
  passar `UUID` por seis camadas e descobrir na produção que era o id errado.

## 3. Imutabilidade

- Modelo de transporte: `ConfigDict(frozen=True, extra="forbid")`. `extra="forbid"` não é
  preciosismo — é o que impede campo renomeado de virar campo silenciosamente ignorado.
- Valor interno sem validação: `@dataclass(frozen=True, slots=True)`.
- Proibido argumento default mutável (`def f(x: list = [])`). O `ruff` pega (`B006`).

## 4. Injeção de dependência

- Construtor, sempre. Dependência declarada como `Protocol`, não como implementação.
- `Depends` do FastAPI apenas em `api.py`, resolvendo provedores para instâncias de serviço.
- Proibidos: variável global mutável, singleton de módulo com estado, `import`-time side effect.

## 5. Tratamento de erro

- Exceção de negócio herda de `DomainError` (`core/errors.py`), carrega código estável e
  contexto estruturado. Handler global traduz para Problem Details
  ([`../../_shared/api-standards.md`](../../_shared/api-standards.md) §3).
- `except Exception` só no handler global e na borda de activity — e sempre registrando e
  reclassificando. `except:` nu e `except ... : pass` são proibidos (`ruff` `E722`, `S110`).
- Encadear causa: `raise ArtefatoInvalidoError(...) from exc`. Perder o `__cause__` apaga a única
  pista útil no diagnóstico.
- Não registrar e relançar a mesma falha (log-and-throw duplicado) — transversal §1.

## 6. Logging

Implementação concreta do transversal, com `structlog`:

- Logger por módulo: `log = structlog.get_logger(__name__)`. Sem `print`, sem `logging` direto.
- Sempre `key=value` estruturado, nunca f-string na mensagem:
  `log.info("etapa_concluida", run_id=..., step_id=..., duracao_ms=...)`.
- Nome do evento em `snake_case`, estável, sem interpolação — é ele que indexa o log.
- `correlationId` injetado por middleware em `contextvars` e ligado ao structlog; toda linha
  o carrega sem que o autor precise lembrar.
- Exceção: `log.exception("falha_na_etapa", ...)` dentro do `except` — o stack trace vai junto.
- **Mascaramento obrigatório** antes de logar qualquer conteúdo vindo de `context/`, de prompt ou
  de saída de agente (ver [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §7).
  Existe um processor do structlog para isso; não se mascara na mão em cada chamada.
- Proibições de conteúdo: transversal §3, sem exceção.

## 7. Async

- Caminho de I/O `async` ponta a ponta. `time.sleep`, `requests`, driver síncrono e chamada de
  arquivo bloqueante dentro de `async def` são proibidos (`ruff` `ASYNC*`).
- Trabalho CPU-bound ou lib síncrona inevitável: `anyio.to_thread.run_sync`.
- Toda operação de rede tem `timeout` explícito. Sem default implícito.
- Task criada sem referência é coletada pelo GC no meio da execução: usar `TaskGroup`, nunca
  `asyncio.create_task` solto (`RUF006`).

## 8. Lint, formatação e complexidade

- `ruff format` é o formatador; linha de 100 colunas.
- `ruff check` com, no mínimo: `E,W,F,I,N,UP,B,A,C4,DTZ,T20,SIM,ARG,PTH,ASYNC,S,RUF`.
- Complexidade ciclomática máxima 10 (`C901`); função com mais de 50 linhas ou 5 parâmetros é
  sinal de que há dois conceitos dentro dela.
- `datetime` sempre com timezone (`DTZ`); `datetime.now()` sem tz é proibido. UTC na persistência.
- Caminho de arquivo com `pathlib`, não `os.path` (`PTH`).

## 9. Supressão de alerta

Suprimir regra de lint, tipo ou segurança exige, na mesma linha ou imediatamente acima: o código
da regra e o **porquê**. Supressão genérica (`# noqa` sem código, `# type: ignore` sem código,
`# nosec` sem justificativa) é reprovada em review.

## 10. Comentários

Comentário explica **por quê**. Docstring em módulo público, classe de serviço e função de
contrato — descrevendo intenção e invariantes, não repetindo a assinatura. Comentário que narra o
código é removido no review.

## 11. Commits

Conventional Commits do transversal, com escopo = domínio (`feat(runs):`, `fix(runners):`).

---

## Checklist

- [ ] `ruff format` e `ruff check` limpos; `mypy --strict` verde
- [ ] Sem `Any`, `type: ignore` ou `noqa` sem código e justificativa
- [ ] Modelos de transporte `frozen=True, extra="forbid"`
- [ ] DI por construtor via `Protocol`; sem global mutável
- [ ] Erros de negócio nomeados, com `from exc`; sem `except` nu
- [ ] `structlog` com evento `snake_case` + campos estruturados; sem f-string, sem `print`
- [ ] Conteúdo de agente/contexto mascarado antes de qualquer log
- [ ] I/O `async` com timeout explícito; nada bloqueante em corrotina
- [ ] Complexidade ≤ 10; `datetime` com timezone; `pathlib` para caminhos
- [ ] Commit no formato Conventional, escopo = domínio
