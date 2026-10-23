### TASK-05.2 — BFF: logout (limpar cookie) [web]

- **Status:** concluída
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-05.1, TASK-01.5
- **Cenários cobertos:** SCN-009.1
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5, §8

#### Contexto

Acrescenta o handler de logout ao proxy de sessão já existente.

#### O que deve ser feito

- [ ] Alterar `frontend/src/app/api/sessoes/route.ts`: adicionar `DELETE` — lê o cookie
      `__Host-sessao`, chama `DELETE ${API_GATEWAY_URL}/v1/sessoes/{id}` no core; **sempre**
      limpa o cookie `__Host-sessao` da resposta (mesmo que, por algum motivo, a chamada ao
      core falhe — o usuário não pode ficar com um cookie que já tentou encerrar); devolve
      `204` ao browser

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/sessoes/route.ts` | alterar | acrescenta o handler `DELETE` |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: o próprio `frontend/src/app/api/sessoes/route.ts` (TASK-01.5, handler
`POST`) — mesmo arquivo, padrão de leitura de cookie já estabelecido.

#### Guia técnico — pontos de atenção

- Limpar o cookie é incondicional — não depender do core responder `204` para isso acontecer.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `DELETE /api/sessoes` limpa o cookie `__Host-sessao` da resposta (`Set-Cookie` com `Max-Age=0` ou equivalente) | `curl -i` |
| 2 | Depois do `DELETE`, acessar uma rota protegida redireciona para `/login` | navegação manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
| 2026-10-23 | concluída (tentativa 1 de 3) | `DELETE` em `app/api/sessoes/route.ts`: chama o core (falha silenciosamente, não bloqueia a limpeza do cookie), sempre limpa `NOME_COOKIE_SESSAO` com `maxAge: 0` e devolve `204`. `npx tsc --noEmit` limpo. Confirmado via SCN-009.1/.2 do spec de logout (ver TASK-05.3, testado em conjunto com a navbar). |
