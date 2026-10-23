### TASK-03.2 — Domínio cliente: repository [api]

- **Status:** concluída
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.1
- **Cenários cobertos:** SCN-004.1, SCN-005.1, SCN-008.1, SCN-008.2
- **Origem:** `docs/techspec/cadastro-clientes/data-model.md`

#### Contexto

Acesso a dado do domínio cliente — único lugar que fala com o SQLite para `clientes` e
`socios`.

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/repository.ts`:
      - `inserirCliente(dados: Omit<Cliente, 'id'|'criadoEm'|'atualizadoEm'>): Cliente` —
        gera `id` (`crypto.randomUUID()`), grava `criado_em = atualizado_em = agora`; se
        `tipo === 'PJ'`, insere cada item de `socios` em `socios` com o `cliente_id`
        correspondente; `INSERT` do cliente e dos sócios dentro da mesma transação
      - `buscarPorDocumento(documento: string): Cliente | null`
      - `listarAtivos(): Cliente[]` — `WHERE excluido_em IS NULL`; para cada `PJ`, junta os
        sócios de `socios`
      - `buscarPorId(id: string): { cliente: Cliente; excluidoEm: string | null } | null`
      - `atualizarCliente(id: string, dados): Cliente` — `UPDATE` dos campos +
        `atualizado_em`; se `PJ`, apaga os sócios antigos e insere os novos (substituição
        completa, sem merge incremental)
      - `marcarExcluido(id: string): void` — `UPDATE clientes SET excluido_em = ? WHERE id =
        ? AND excluido_em IS NULL` (não reescreve se já estava excluído — idempotente por
        construção)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/repository.ts` | criar | funções acima |
| `backend/src/cliente/model.ts` | alterar | fora do escopo original (entregue na TASK-03.1) — acrescenta `DadosCliente` (Omit distributivo), ver Histórico |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/data-model.md` ("Tabelas" — `clientes`,
`socios`, índices) e `governance/guidelines/backend/node/architecture.md` §3 ("a linha crua
lida do SQLite nunca sai do `repository`").

#### Guia técnico — pontos de atenção

- A constraint `UNIQUE` em `documento` lança erro no `INSERT` do SQLite — deixar esse erro
  propagar (ou traduzi-lo para um valor de retorno reconhecível) para o `service` decidir o
  `ConflitoError` (RN-007) — a decisão de qual dos dois mecanismos usar é livre, desde que o
  `service` (TASK-03.3) consiga distinguir "documento duplicado" de qualquer outro erro.
- Sócios são substituídos por completo na edição (apagar tudo e reinserir), nunca mesclados
  campo a campo — simplicidade aceitável na escala desta demo.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `inserirCliente` com dados PF grava e devolve o cliente com `id` gerado | script Node manual |
| 2 | `inserirCliente` com dados PJ grava os sócios vinculados ao `cliente_id` correto | `SELECT * FROM socios` |
| 3 | `listarAtivos()` não retorna um cliente depois de `marcarExcluido(id)` ter sido chamado para ele | inserir, excluir, listar |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
| 2026-10-23 | concluída (tentativa 1 de 3) | `repository.ts` com `inserirCliente`/`buscarPorDocumento`/`listarAtivos`/`buscarPorId`/`atualizarCliente`/`marcarExcluido`, transação manual (`BEGIN`/`COMMIT`/`ROLLBACK`, `node:sqlite` não tem wrapper de transação pronto). Divergência de tipo corrigida: a assinatura `Omit<Cliente, 'id'\|'criadoEm'\|'atualizadoEm'>` sugerida na task não compila — `Omit` não distribui sobre união, perde o discriminante `tipo`. Criado `DadosCliente` (Omit distributivo) em `model.ts` e usado no lugar. Critérios 1-3 confirmados via script Node contra `dist/`. `npx tsc --noEmit` limpo. `check_escopo.py --base HEAD` → exit 0. |
