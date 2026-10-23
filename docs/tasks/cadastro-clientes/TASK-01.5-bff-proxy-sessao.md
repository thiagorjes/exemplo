### TASK-01.5 — BFF: proxy de sessão e cookie [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.3, TASK-01.4
- **Cenários cobertos:** SCN-001.1, SCN-001.3
- **Origem:** `docs/techspec/cadastro-clientes-techspec.md` §5 (Arquitetura e Fluxo) e §8 (Segurança)

#### Contexto

O BFF nunca expõe a API core diretamente ao browser. Esta task cria a troca de credencial
por cookie de sessão e a validação de sessão em rotas protegidas — sem isso, nenhuma tela
além do login pode existir.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/api/sessoes/route.ts`: `POST` lê `{ cpf, senha }` do corpo,
      chama `fetch(`${process.env.API_GATEWAY_URL}/v1/sessoes`, ...)`; em `201`, seta o
      cookie `__Host-sessao` (`httpOnly: true, secure: true, sameSite: 'strict', path: '/'`)
      com o `id` recebido do core, e devolve ao browser **só** `{ papel }` (nunca o `id` da
      sessão em claro no corpo de resposta); em `401`, repassa `401` sem o corpo do core
- [ ] Criar `frontend/src/proxy.ts`: função `validarSessaoAtual()` que lê o cookie
      `__Host-sessao`, chama `GET ${API_GATEWAY_URL}/v1/sessoes/{id}` no core; se `401`,
      limpa o cookie e retorna `null`; se `200`, retorna `{ usuarioId, papel }`
- [ ] Criar `frontend/src/app/(protected)/layout.tsx`: chama `validarSessaoAtual()`; se
      `null`, redireciona para `/login`

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/api/sessoes/route.ts` | criar | `POST` — troca credencial por cookie |
| `frontend/src/proxy.ts` | criar | `validarSessaoAtual()` |
| `frontend/src/app/(protected)/layout.tsx` | criar | redireciona para `/login` sem sessão válida |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes-techspec.md` §5, passos 1 a 4 (fluxo
completo login → cookie → navegação protegida) e §8 ("Cookie `__Host-sessao`: `HttpOnly`,
`Secure`, `SameSite=Strict`, `Path=/`, sem `Domain`").

#### Guia técnico — pontos de atenção

- O `id` de sessão nunca é exposto ao JavaScript do browser — fica só no cookie `HttpOnly`.
  Não incluir o `id` em nenhum corpo JSON que o BFF devolve ao browser.
- `__Host-` exige `Secure` e `Path=/` sem `Domain` — omitir qualquer um desses quebra o
  prefixo no browser.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `POST /api/sessoes` com credencial válida responde com `Set-Cookie: __Host-sessao=...` | `curl -i` ou DevTools |
| 2 | Acessar uma rota sob `app/(protected)/` sem o cookie redireciona para `/login` | navegação manual |
| 3 | Cookie com valor inválido é limpo e a navegação redireciona para `/login` | manipular o cookie manualmente e navegar |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
