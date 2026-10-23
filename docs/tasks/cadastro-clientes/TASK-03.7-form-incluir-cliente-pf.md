### TASK-03.7 — Formulário de inclusão de cliente Pessoa Física (T4) [web]

- **Status:** pendente
- **Sistema:** web
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-03.6
- **Cenários cobertos:** SCN-004.1, SCN-004.2, SCN-004.3
- **Origem:** `docs/design/cadastro-clientes-design-brief.md` (tela T4); `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`

#### Contexto

Fecha RF-004 visualmente — formulário de inclusão para Pessoa Física.

#### O que deve ser feito

- [ ] Criar `frontend/src/app/(protected)/clientes/novo/page.tsx`: seletor de tipo (Pessoa
      Física / Pessoa Jurídica) no topo; quando Pessoa Física, mostra os campos
      `nomeCompleto`, `documento` (CPF, máscara), `dataNascimento`, `endereco`, `telefone`;
      validação do formulário com o **mesmo** schema Zod do backend (`backend/src/cliente/schema.ts`,
      TASK-03.1 — reescrever a validação no lado do formulário com `react-hook-form` +
      `@hookform/resolvers/zod`, espelhando os campos)
- [ ] Submit chama `POST /api/clientes` com `{ tipo: 'PF', ... }`; sucesso: toast ("Cliente
      cadastrado com sucesso.") e redireciona para `/clientes`, onde o novo cliente aparece
      na lista
- [ ] Erro `400`: mensagem inline por campo, a partir de `errors[{ field, message }]` da
      resposta
- [ ] Erro `409`: toast de conflito citando o documento (`dadosApoio.documento`)

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `frontend/src/app/(protected)/clientes/novo/page.tsx` | criar | formulário, modo Pessoa Física |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `e2e/`,
`docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html` (referência visual).

#### Guia técnico — padrão a seguir

Referência viva: `docs/design/cadastro-clientes/prototypes/IncluirEditarCliente.html`
(estado Pessoa Física) e `backend/src/cliente/schema.ts` (TASK-03.1, campos exatos a
espelhar no formulário).

#### Guia técnico — pontos de atenção

- O campo `tipo` não é alterável depois de criado (regra que vale para a edição, no EPIC-04)
  — aqui, na inclusão, é só a primeira escolha do formulário.
- O modo Pessoa Jurídica desta mesma página é acrescentado pela TASK-03.8, que altera este
  arquivo — não deixar a estrutura do componente de um jeito que dificulte adicionar o modo
  PJ em seguida (ex.: isolar os campos de PF em um sub-componente ou bloco condicional claro).

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Preencher todos os campos de Pessoa Física e confirmar cria o cliente e redireciona para `/clientes`, onde ele aparece | navegação manual |
| 2 | Deixar um campo obrigatório vazio mostra erro inline no campo, sem submeter | navegação manual |
| 3 | Incluir com um CPF já cadastrado mostra mensagem de conflito | navegação manual, repetindo CPF |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`. |
