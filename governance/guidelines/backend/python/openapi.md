# OpenAPI — Backend Python

> Condicional da coleção. Materializa [`../../_shared/api-standards.md`](../../_shared/api-standards.md)
> na documentação gerada. Convenções de rota: [`fastapi.md`](fastapi.md).

## 1. O documento é contrato, não subproduto

O OpenAPI é gerado pelo FastAPI a partir do código, mas é tratado como artefato versionado:
`docs/contracts/openapi.json` é commitado e o CI falha quando o gerado diverge do commitado sem
que o diff tenha sido revisado. Mudança de contrato deve aparecer no PR.

## 2. Obrigatório por rota

- `summary` (imperativo, uma linha) e `description` (o que a operação decide, não o que ela faz).
- `operation_id` explícito, estável, em `snake_case` — é o nome do método no cliente gerado.
  Renomear `operation_id` é breaking change.
- `tags` = domínio.
- `response_model` do caminho feliz e **respostas de erro declaradas** com o schema de Problem
  Details (400, 401, 403, 404, 409, 422, 429, 5xx conforme aplicável). Documentação que só mostra
  o 200 é metade do contrato.
- `status_code` explícito; `201` com header `Location` documentado.
- Exemplos em request e response, com dados fictícios. Exemplo com CPF, token ou dado real de
  cliente é vazamento — vale a proibição de
  [`../../_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md) §3.

## 3. Schemas

- Nome de schema derivado do modelo pydantic, em `PascalCase` e estável.
- `description` em campo cujo nome não é autoexplicativo; unidade declarada onde existir
  (`timeout_segundos`, `custo_centavos`).
- Campos obrigatórios marcados corretamente — `Optional` usado por conveniência de código produz
  contrato frouxo.
- Enum de domínio exposto como enum no schema, com todos os valores.
- Schema de erro único (Problem Details), reutilizado por todas as rotas.

## 4. Versionamento e depreciação

- Versão do documento = versão da API no caminho (`/v1`), conforme transversal §1.
- Depreciação: `deprecated=True` + `description` indicando o substituto e a data de remoção +
  header `Sunset` na resposta. Remoção só na major seguinte.
- Breaking change (campo removido, tipo alterado, `operation_id` renomeado, obrigatoriedade nova)
  exige nova versão de caminho, não edição da atual.

## 5. Exposição

- `/docs` e `/openapi.json` **não** são públicos em produção: exigem autenticação ou ficam
  restritos à rede interna ([`../../_shared/api-security.md`](../../_shared/api-security.md) §4).
- `/redoc` desabilitado se não houver uso.
- O documento não descreve rota interna de operação (`/health`, métricas) para consumidor externo.

## 6. Verificação

```
pytest tests/contract/test_openapi_snapshot.py   # gerado == docs/contracts/openapi.json
```

O mesmo teste verifica: todo `operation_id` presente e único, toda rota com respostas de erro
declaradas, nenhum schema `AnyType`/genérico vazando.

---

## Checklist

- [ ] `docs/contracts/openapi.json` commitado e em dia; diff revisado no PR
- [ ] `operation_id` explícito, único e estável em toda rota
- [ ] Respostas de erro declaradas com schema Problem Details compartilhado
- [ ] Exemplos com dados fictícios, sem dado real ou sensível
- [ ] Campos obrigatórios corretos; unidades declaradas; enums completos
- [ ] Depreciação com substituto, data e header `Sunset`
- [ ] `/docs` e `/openapi.json` não públicos em produção
- [ ] Teste de snapshot de contrato verde
