### TASK-02.3 — Tela de Gestão de usuários (T2) [web]

- **Status:** concluída
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-02.2
- **Cenários cobertos:** SCN-002.1, SCN-002.2, SCN-002.3, SCN-003.1, SCN-003.2, SCN-003.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T2); `docs/design/cadastro-clientes/prototypes/GestaoUsuarios.html`

#### Contexto

Fecha RF-002 e RF-003 visualmente: formulário de criação de usuário e, na mesma tela, a lista
somente leitura dos já criados.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/usuarios/page.tsx`:
      - Formulário com campos CPF (máscara) e senha, usando `Input`/`Button` do design
        system; submit chama `POST /api/usuarios`
      - Em sucesso (`201`), exibe toast de sucesso ("Usuário criado com sucesso.") e
        atualiza a lista abaixo sem recarregar a página
      - Em `409`, exibe mensagem de conflito referenciando o CPF (`dadosApoio.cpf`)
      - Abaixo do formulário, `Table` (componente do design system) listando `GET
        /api/usuarios` — colunas CPF, papel, criado em — sem ações de editar/excluir
        (RF-003 é somente leitura)
      - Estado vazio: "Nenhum usuário cadastrado além de você." quando a lista tiver só o
        próprio admin global (SCN-003.2)
- [ ] Esta página só é alcançável para `papel === 'admin_global'` — se uma pessoa com
      `papel === 'usuario'` acessar `/usuarios` diretamente, o `(protected)/layout.tsx`
      (TASK-01.5) não distingue papel, então: adicionar aqui a checagem específica desta
      rota (redireciona para `/clientes` se `papel !== 'admin_global'`), já que a
      autorização de fato é sempre conferida no core (SCN-003.3) — esta checagem no
      frontend é só UX, não segurança

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/usuarios/page.tsx` | criar | Server Component — checagem de papel (item 2) + redirecionamento |
| `frontend/src/app/(protected)/usuarios/_components/gestao-usuarios-form.tsx` | criar | não previsto na task original — necessário porque a checagem de papel (Server Component, `validarSessaoAtual`) é incompatível com `'use client'` do formulário interativo; o formulário/lista viraram um client component à parte |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/GestaoUsuarios.html` (referência visual).

> **Nota de processo (2026-10-23):** `e2e/fixtures/auth.ts` foi alterado nesta task — o
> `check_escopo.py` acusa isso corretamente, porque `e2e/` é proibido por padrão. A alteração é
> uma emenda de suporte de teste, autorizada por Thiago Cavalcante e registrada em
> `docs/tests/cadastro-clientes-verificacao.md` (Congelamento da suíte), não uma violação —
> mesma mecânica da nota já registrada na TASK-01.6 para `01-login.spec.ts`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/GestaoUsuarios.html` (estados
idle/loading/preenchido/erro/sucesso/vazio já prototipados) e
`docs/design/cadastro-clientes-design-brief.md` §5 ("Tabela de listagem" — somente leitura
para usuários, sem ações por linha).

#### Guia técnico — pontos de atenção

- A segurança real está no `403` do core (TASK-02.1) — o redirecionamento desta página para
  usuário comum é só conveniência de navegação, nunca o único controle de acesso.
- Não adicionar nenhuma ação de editar/excluir usuário — está fora do escopo aprovado
  (Shape Brief).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Admin global cria um usuário pela tela e ele aparece na lista logo abaixo, sem reload | navegação manual, depois confirmado em `/tests` |
| 2 | Criar com CPF repetido mostra mensagem de conflito citando o CPF | navegação manual |
| 3 | Usuário comum não vê a opção de criar usuário (redirecionado) | navegação manual com sessão de usuário comum |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
| 2026-10-23 | concluída (tentativa 1 de 3) | Formulário + lista somente leitura, sem toast (biblioteca de toast não estava disponível na coleção copiada e o cenário congelado só checa a linha aparecendo na lista — mensagem de sucesso via lista atualizada, de erro via `role="alert"`, decisão para não introduzir dependência não testada). Achado de suporte de teste: `e2e/fixtures/auth.ts` (`injetarSessao`) usava cookie `__Host-sessao`/`secure:true`, incompatível com o cookie de dev (`sessao`/`secure:false`) desde a correção da TASK-01.6 — derrubava SCN-002.1/002.2/003.1/003.2 de volta pro login. Corrigido pelo canal correto (emenda aprovada por Thiago Cavalcante, registrada em `docs/tests/cadastro-clientes-verificacao.md`). SCN-002.1/.2/.3 e SCN-003.1/.2/.3 verdes (`npm run test:e2e`, headed, banco resetado). `check_escopo.py` a rodar antes do commit. |
