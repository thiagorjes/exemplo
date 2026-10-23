# Padrões Não Funcionais (transversal)

> Metas e prazos que valem enquanto a área dona da demanda não declarar outros. Existem
> para a especificação não sair com lacuna ("[meta a definir]") que trava plano, testes e
> revisão. Quem troca o valor é a área dona — com o DPO, quando for retenção de dado pessoal.

## 1. Como usar

- Sem meta declarada no requisito, a especificação adota o valor desta página e o registra
  como **padrão das normas**: decisão vigente, não pergunta aberta nem pendência. A área dona
  pode trocá-lo a qualquer momento.
- Valor declarado pela área dona substitui o padrão; a especificação cita a decisão.
- O padrão é piso de qualidade, não teto: a feature pode declarar meta mais exigente.

## 2. Desempenho

| Operação | Meta padrão |
|---|---|
| Leitura (GET, `POST /<recurso>/consultas`) | p95 ≤ 500 ms |
| Escrita (POST, PUT, PATCH, DELETE) | p95 ≤ 1 s |
| Carga de referência | 50 requisições/s sustentadas, medidas em homologação |

- Medido no serviço, sem a latência do cliente; dependência externa entra no tempo.
- A verificação registra a janela de medição, o número de requisições por rota e a vazão
  observada. Abaixo da carga de referência, a meta fica **aprovada condicionalmente** e é
  reavaliada em produção: a aprovação condicional libera a ida a produção, e o responsável pela
  API reavalia com dados de produção em até 30 dias.
- O p95 é calculado do histograma no Prometheus (`histogram_quantile`), com buckets exatos nas metas;
  percentil calculado no cliente não é exportado com histograma ativo e não serve como evidência.
- O plano diz como a meta é verificada: métrica `prometheus` observada em homologação. Teste de
  carga não faz parte do build nem das tarefas da feature.

## 3. Retenção

| Dado | Prazo padrão | Ao fim do prazo |
|---|---|---|
| Dado pessoal de registro removido logicamente | 5 anos após a remoção | anonimizar (o registro fica, o titular não é mais identificável) |
| Evento de auditoria | 5 anos | expurgar |
| Registro de idempotência (`Idempotency-Key`) | 24 h | expurgar |

- Retenção é decisão de negócio e de LGPD: o padrão só evita que a feature saia sem prazo.
- A rotina de anonimização/expurgo é parte da feature que cria o dado, não trabalho futuro.
- Cada execução de uma rotina de expurgo ou anonimização grava um evento de auditoria de resumo
  (quantidade e período afetado): assim "toda alteração é auditada" vale sem exceção.

---

## Checklist

- [ ] Especificação declara meta de desempenho ou registra o padrão das normas
- [ ] Especificação declara retenção de cada dado pessoal ou registra o padrão das normas
- [ ] Plano diz como a meta de desempenho é verificada
- [ ] Rotinas de anonimização e expurgo previstas na mesma feature
