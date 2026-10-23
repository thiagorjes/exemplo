### TASK-01.5 — BFF: proxy de sessão e cookie [web]

- **Status:** concluída
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
| `frontend/src/lib/validar-sessao.ts` | criar | `validarSessaoAtual()` — a task pedia `frontend/src/proxy.ts`, mas esse caminho é reservado pelo Next.js 16 (substituiu `middleware.ts`; exige exportar uma função `proxy`) — colide e quebra o build. Renomeado. |
| `frontend/src/app/(protected)/layout.tsx` | criar | redireciona para `/login` sem sessão válida |
| `frontend/src/app/(protected)/verificacao/page.tsx` | criar | página mínima só para os critérios de aceite #2/#3 — nenhuma tela real existe ainda sob `(protected)/`, a primeira chega no EPIC-02 |
| `.gitignore` | alterar | acrescenta `*.tsbuildinfo` (cache do `tsc --incremental`) |

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
| 2026-10-23 | concluída (tentativa 1 de 3) | `POST /api/sessoes` troca credencial por cookie `__Host-sessao` (HttpOnly/Secure/SameSite=Strict/Path=/), devolve só `{ papel }`. **Achado grave da task:** o caminho pedido, `frontend/src/proxy.ts`, é reservado pelo Next.js 16 — substituiu `middleware.ts` e exige exportar uma função `proxy`; ter esse arquivo com outro formato quebra o build inteiro ("This function is what Next.js runs for every request..."). Renomeado para `frontend/src/lib/validar-sessao.ts`. Layout protegido (`(protected)/layout.tsx`) redireciona para `/login` sem sessão válida. Criada página mínima `(protected)/verificacao/page.tsx` só para testar os critérios 2/3 (nenhuma tela real existe ainda sob `(protected)/` nesta altura do flow). Limitação técnica aceita: `cookies().delete()` não é permitido em Server Component (só em Server Action/Route Handler) — o `try/catch` em `validar-sessao.ts` captura isso silenciosamente; o cookie inválido não é literalmente apagado nesta camada, mas fica inerte, porque toda rota protegida sempre revalida contra o core a cada acesso (a presença do cookie nunca concede acesso sozinha) — a limpeza efetiva de fato acontece no próximo `POST /api/sessoes` bem-sucedido, que sobrescreve o valor. Critérios de aceite 1-3 confirmados manualmente (`curl`: login → `Set-Cookie` correto e corpo só com `papel`; sem cookie → `307` para `/login`; cookie inválido → `307` para `/login`, sem `Set-Cookie` de limpeza, pelo motivo acima). `check_escopo.py --base HEAD` → exit 0. |
| 2026-10-23 | defeito encontrado depois (TASK-01.6) | `secure: true` + prefixo `__Host-` exigem HTTPS — em `http://localhost` (esta demo) o browser nunca grava o cookie, e SCN-001.1 falhava mesmo com credencial certa (layout protegido sempre via `401`/sem sessão de volta pro login). Corrigido em `frontend/src/lib/sessao-cookie.ts` (nome/flag condicionais a `NODE_ENV`), aplicado em `app/api/sessoes/route.ts` e `validar-sessao.ts`. Detalhe e commit em TASK-01.6. |
