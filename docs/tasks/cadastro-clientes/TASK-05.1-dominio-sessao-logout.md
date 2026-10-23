### TASK-05.1 — Domínio sessão: logout [api]

- **Status:** concluída
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.3
- **Cenários cobertos:** SCN-009.1, SCN-009.2, SCN-009.3
- **Origem:** `docs/techspec/cadastro-clientes/contracts/sessao.md` (`DELETE /v1/sessoes/{id}`)

#### Contexto

Acrescenta o `DELETE` de logout aos arquivos de sessão criados na TASK-01.3 — deliberadamente
separado daquela task porque RF-009 nasceu de uma emenda posterior ao PRD original.

#### O que deve ser feito

- [ ] Alterar `backend/src/sessao/repository.ts`: adicionar `encerrarSessao(id: string):
      void` — `UPDATE sessoes SET encerrada_em = ? WHERE id = ? AND encerrada_em IS NULL`
      (não falha nem reescreve se já estava encerrada — idempotente por construção)
- [ ] Alterar `backend/src/sessao/service.ts`: adicionar `logout(id: string): void` — chama
      `encerrarSessao(id)` **sempre**, sem checar antes se a sessão existe, já está
      encerrada ou já expirou (idempotente por design — RF-009, SCN-009.2 e SCN-009.3)
- [ ] Alterar `backend/src/sessao/routes.ts`: adicionar `DELETE /:id` — chama `logout(id)`;
      responde **sempre** `204 No Content`, independentemente do estado anterior da sessão

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/sessao/repository.ts` | alterar | acrescenta `encerrarSessao` |
| `backend/src/sessao/service.ts` | alterar | acrescenta `logout` |
| `backend/src/sessao/routes.ts` | alterar | acrescenta `DELETE /:id`; virou factory `criarSessaoRouter(logoutFn)` — ver nota |
| `backend/src/app.ts` | alterar | fora do escopo original — `AppDeps.sessaoRepository` ganhou `encerrar?`, ao lado de `validar?` (TASK-04.1); injeta `logoutFn` em `criarSessaoRouter` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, conteúdo dos testes já existentes em `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/contracts/sessao.md`, seção `DELETE
/v1/sessoes/{id}` ("204 No Content — sempre, inclusive quando a sessão já estava encerrada ou
expirada").

#### Guia técnico — pontos de atenção

- Diferente do `DELETE` de cliente (que pode devolver `404` se o `id` nunca existiu), o
  `DELETE` de sessão **nunca** devolve erro — nem para um `id` que nunca existiu. É assim por
  definição no contrato, não uma inconsistência a corrigir.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `DELETE /v1/sessoes/{id}` de uma sessão ativa devolve `204`; um `GET /v1/sessoes/{id}` logo depois devolve `401` | dois `curl`s em sequência |
| 2 | `DELETE /v1/sessoes/{id}` chamado duas vezes seguidas devolve `204` nas duas vezes | dois `curl`s |
| 3 | `DELETE /v1/sessoes/{id-qualquer-inexistente}` também devolve `204` | `curl` com um id inventado |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`; separada da TASK-01.3 de propósito, por ser uma emenda posterior ao PRD. |
| 2026-10-23 | concluída (tentativa 1 de 3) | `encerrarSessao`/`logout`/`DELETE /:id` idempotentes, seguindo `criarXService(repo)`/`criarApp(deps)` (padrão DI já estabelecido em TASK-04.1). Critérios 1-3 confirmados via `curl` (204/401/204/204). `npm test`: `sessao/routes.test.ts` (SCN-009.3, 2 testes) e `cliente/routes.test.ts` (SCN-006.3) todos passam agora — zera a pendência de EPIC-04/05 registrada desde TASK-01.3. `npx tsc --noEmit` limpo. `check_escopo.py --base HEAD` → exit 0. |
