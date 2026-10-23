# Testes — Backend Python

> Ferramentas e versões: [`stack.md`](stack.md). Camadas testadas: [`architecture.md`](architecture.md).

## 1. Estratégia por camada

| Camada | Ferramenta | Foco | Dependência externa |
|---|---|---|---|
| Serviço / domínio | `pytest` | Regra de negócio, decisão, erro nomeado | Nenhuma — fakes em memória |
| Workflow Temporal | `temporalio.testing.WorkflowEnvironment` (time-skipping) | Ordem das etapas, retry, timeout, rota de exceção | Activities mockadas |
| Activity | `pytest-asyncio` + `ActivityEnvironment` | Idempotência, mapeamento de erro | Fronteiras fakes |
| Persistência | `pytest` + `testcontainers` (Postgres real) | Query, migration, constraint, transação | Postgres efêmero |
| API | `httpx.ASGITransport` | Contrato HTTP, status, Problem Details, autorização | App montado com fakes |
| Runner / sandbox | `pytest` marcado `docker` | Ciclo de vida do container, contrato do bundle e do `result.json` | Docker real |
| Contrato de etapa | `pytest` (`tests/contract/`) | Todo runner satisfaz o mesmo contrato | Runner fake + runners reais |

Proibido mockar SQLAlchemy, o cliente Docker ou o `httpx` internamente. Mock de biblioteca testa o
mock. Use container real (persistência, sandbox) ou fake da **sua** interface (`Protocol`).

## 2. Regras gerais

- Nome descreve condição e resultado esperado: `test_executar_etapa_sem_result_json_falha`.
- Um comportamento por teste. Assert único conceitual; múltiplos asserts só se descrevem o mesmo fato.
- Arrange-Act-Assert explícito e visível.
- Sem `sleep` real. Tempo em teste é controlado (time-skipping do Temporal, relógio injetado).
- Sem ordem entre testes e sem estado compartilhado. Fixture que vaza estado entre testes é bug.
- Dado de teste por **factory**, não por dicionário copiado em vinte arquivos.
- Teste `xfail`/`skip` exige motivo e prazo; skip permanente é cobertura fantasma.

## 3. O que é obrigatório testar

Cada item abaixo é falha de review se ausente:

- Todo erro de negócio nomeado tem um teste que o provoca e verifica o status/Problem Details.
- Toda activity tem teste de **idempotência**: executar duas vezes com a mesma chave produz um
  único efeito.
- Todo workflow tem teste de caminho de falha: etapa falhando, retry esgotado, timeout, cancelamento.
- Todo contrato de bundle/`result.json` tem teste de rejeição: artefato declarado e ausente,
  artefato presente e não declarado, caminho com travessia de diretório, `result.json` malformado.
- Toda rota tem teste de autorização negada, não só do caminho feliz.
- Toda migration sobe e desce (`upgrade` + `downgrade`) contra banco real.

## 4. Testes de contrato de runner

`tests/contract/` contém **uma** suíte parametrizada por implementação de `Runner`. Adicionar um
runner novo (Goose, outro CLI) significa adicionar um parâmetro — não escrever testes novos. Se a
suíte precisar de um caso especial para um runner, o contrato vazou e o desenho deve ser corrigido
antes do teste (ver [`../../_shared/agent-execution.md`](../../_shared/agent-execution.md) §4).

Testes que exigem Docker ou rede são marcados (`@pytest.mark.docker`, `@pytest.mark.external`) e
excluídos do ciclo rápido de desenvolvimento, mas **obrigatórios** no CI de merge.

## 5. Chamadas a modelo em teste

- Nenhum teste automatizado chama o provedor de modelo real. O runner é substituído por um fake
  que produz `out/` determinístico.
- Cenários com saída real de modelo ficam em suíte de avaliação separada, executada sob demanda,
  fora do gate de merge, com orçamento declarado.

## 6. Cobertura

| Escopo | Mínimo |
|---|---|
| Global (`app/`) | 85% de linha |
| `*/service.py`, `steps/`, `runners/`, `workflow.py` | 95% de linha e de branch |
| `api.py`, `entities.py`, `config.py` | Sem meta própria — cobertos por integração |

Cobertura é piso, não objetivo. Teste escrito para subir percentual sem afirmar comportamento é
removido no review. Queda de cobertura em PR reprova o merge.

---

## Checklist

- [ ] Camada testada com a ferramenta da tabela; sem mock de biblioteca externa
- [ ] Nome do teste descreve condição e resultado; um comportamento por teste
- [ ] Sem `sleep`, sem estado compartilhado, sem dependência de ordem
- [ ] Erro de negócio, idempotência de activity, caminho de falha de workflow cobertos
- [ ] Rejeições de contrato de bundle/`result.json` cobertas
- [ ] Autorização negada testada em toda rota
- [ ] Suíte de contrato de runner parametrizada, sem caso especial por implementação
- [ ] Nenhuma chamada a modelo real no gate de merge
- [ ] Cobertura dentro das metas; sem queda no PR
