### TASK-03.3 — Domínio cliente: regras de negócio [api]

- **Status:** concluída
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.2
- **Cenários cobertos:** SCN-004.2, SCN-005.2
- **Origem:** `docs/techspec/cadastro-clientes/contracts/cliente.md`; `docs/techspec/cadastro-clientes/data-model.md` ("Decisão de modelagem — exclusão lógica")

#### Contexto

Aplica as regras de negócio que o schema (TASK-03.1) e o repository (TASK-03.2) sozinhos não
cobrem: duplicidade de documento e a distinção 404/410 usada pela edição e exclusão (que
chegam no EPIC-04, mas o método já nasce pronto para os dois usos).

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/service.ts`:
      - `incluirCliente(dados: z.infer<typeof clienteSchema>): Cliente` — chama
        `buscarPorDocumento(dados.documento)`; se existir, lança `ConflitoError` com
        `codigoRegra: "RN-CLI-01"`, `dadosApoio: { documento: dados.documento }` (RN-007);
        senão chama `inserirCliente`
      - `listarClientes(): Cliente[]` — delega a `listarAtivos()`
      - `obterCliente(id: string): Cliente` — chama `buscarPorId(id)`; se `null`, lança
        `RecursoNaoEncontradoError(404)`; se `excluidoEm` preenchido, lança
        `RecursoNaoEncontradoError(410)`; senão devolve `cliente`
      - `editarCliente(id: string, dados): Cliente` — chama `obterCliente(id)` primeiro (dá
        os `404`/`410` corretos antes de validar o resto); se campo obrigatório do `tipo`
        ficaria vazio, lança erro de validação (`400`); senão chama `atualizarCliente`
      - `excluirCliente(id: string): void` — chama `buscarPorId(id)`; se `null` (nunca
        existiu), lança `RecursoNaoEncontradoError(404)`; se encontrado (excluído ou não),
        chama `marcarExcluido(id)` sem lançar erro nos dois casos (idempotente, RF-007
        SCN-007.2)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/service.ts` | criar | funções acima |
| `backend/src/core/errors.ts` | alterar | fora do escopo original (entregue na TASK-01.1) — ver Histórico |
| `backend/src/middlewares/error-handler.ts` | alterar | fora do escopo original (entregue na TASK-01.1) — ver Histórico |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/cliente.md` (todos os status code
e `codigoRegra`, literal) e `backend/src/core/errors.ts` (TASK-01.1 — `RecursoNaoEncontradoError`
aceita `status` no construtor, por isso serve tanto para `404` quanto para `410`).

#### Guia técnico — pontos de atenção

- `excluirCliente` **nunca** lança erro para "já estava excluído" — só para "nunca existiu".
  É a diferença entre `DELETE` (idempotente, sempre sucesso se encontrou a linha alguma vez)
  e `GET`/`PUT` (que precisam de `410` para avisar que não há mais o que ler/editar) — ver
  `docs/techspec/cadastro-clientes/contracts/cliente.md`, nota "Por que `DELETE` não usa 410".
- `editarCliente` não implementa controle de concorrência (SCN-006.3, EPIC-04) — a última
  chamada que chegar prevalece, decisão já registrada, não lacuna.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `incluirCliente` com `documento` já cadastrado lança erro com `codigoRegra: "RN-CLI-01"` | script Node manual |
| 2 | `obterCliente` de um `id` inexistente lança erro com `status 404`; de um cliente já excluído lança `status 410` | script Node manual, os dois casos |
| 3 | `excluirCliente` chamado duas vezes seguidas no mesmo `id` não lança erro na segunda chamada | script Node manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; `editarCliente`/`excluirCliente` escritos aqui mas só expostos por rota no EPIC-04. |
| 2026-10-23 | concluída (tentativa 1 de 3) | `service.ts` criado. Divergência corrigida: a task afirmava que `RecursoNaoEncontradoError` já aceitava `status` no construtor (TASK-01.1) — na verdade tinha `status = 404` fixo. Ajustado o construtor para `(message, status = 404, codigoRegra?)` e `error-handler.ts` (`categoria()`) para mapear também `410` → `urn:...:erro:nao-encontrado`. Nenhum outro uso existente de `RecursoNaoEncontradoError` foi afetado (conferido via grep, só havia o import em `error-handler.ts`). Critérios 1-3 confirmados via script Node. `npx tsc --noEmit` limpo. `check_escopo.py --base HEAD` → exit 0. |
