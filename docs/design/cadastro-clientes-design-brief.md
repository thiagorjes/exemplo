# Design Brief — cadastro-clientes
_Versão: 1.0 | Data: 2026-10-22 | Designer: agente (flow IDSD)_
_Shape Brief: docs/shape/cadastro-clientes-brief.md_
_Solution: docs/solution/cadastro-clientes-solution.md_

---

## 1. Contexto e Objetivo

**Feature:** cadastro-clientes
**Objetivo de UX:** substituir o preenchimento livre em planilha por um formulário estruturado e validado, que permita localizar um cliente rapidamente e impedir dado inconsistente — sem abrir mão de controle de acesso (login obrigatório para qualquer operação).
**Público-alvo:** uso interno, dois papéis — Admin global (cria usuário) e Usuário (login + CRUD de cliente PF/PJ) — em desktop, resolução de referência 1440×900. Sem suporte a mobile/tablet nesta entrega.

> Design system detectado e reutilizado integralmente: `governance/guidelines/frontend/nextjs/design-system.md` + `governance/guidelines/frontend/_shared/design-system-common.md` (Banestes — Next.js 16 + Tailwind 3.4 + Radix + shadcn/ui). Nenhuma decisão de marca, paleta, tipografia ou navegação é tomada aqui — as seções 2–4 abaixo **replicam** os valores já definidos na biblioteca para referência; a fonte normativa continua sendo a coleção.

---

## 2. Tokens de Cor

> Réplica de `governance/guidelines/frontend/_shared/design-tokens.json` (tema claro). Fonte de verdade: a coleção `frontend/nextjs`, não este documento.

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | `#004b8d` | Ações principais (ex.: "Salvar cliente", "Criar usuário") |
| `--color-secondary` | `#ffffff` (borda `#e5e7eb`) | Ações secundárias (ex.: "Cancelar") |
| `--color-background` | `#ffffff` | Fundo de tela |
| `--color-surface` | `#ffffff` | Cards, modal de confirmação de exclusão |
| `--color-error` | `#fef2f2` / texto `#991b1b` | Erro de validação de formulário, credencial inválida |
| `--color-success` | token `emerald` utilitário (`bg-emerald-50`/`text-emerald-700`) | Toast de sucesso ("Cliente cadastrado", "Usuário criado") |
| `--color-text-primary` | `#374151` | Texto principal |
| `--color-text-secondary` | `grayDark-500` `#85888E` | Texto auxiliar, legendas de campo |

Tema escuro replica a mesma semântica com os valores `dark` do token JSON (ex.: `background #0c111d`, `primary` mantém `#004b8d`).

---

## 3. Tipografia

| Token | Fonte | Peso | Tamanho | Uso |
|-------|-------|------|---------|-----|
| `--font-heading-1` | Inter | SemiBold (600) | `2xl` — 1.5rem / 24px | Título da tela (ex.: "Clientes", "Criar usuário") |
| `--font-heading-2` | Inter | SemiBold (600) | `lg` — 1.125rem / 18px | Título de seção (ex.: "Dados do sócio") |
| `--font-body` | Inter | Regular (400) | `base` — 1rem / 16px | Texto corrido, labels de campo |
| `--font-caption` | Inter | Regular (400) | `sm` — 0.875rem / 14px | Mensagem de erro de campo, metadados de linha da tabela |
| `--font-code` | — | — | — | Não aplicável — sem exibição de código nesta feature |

---

## 4. Espaçamento e Grid

- **Grid:** container de página com padding lateral, sem grid de 12 colunas formal — layout de formulário em coluna única/dupla conforme o Banestes já usa.
- **Breakpoints:** app é desktop-first (`xl` 1280px dominante); esta feature só precisa ser correta em 1440×900 — breakpoints `sm`/`md` não são alvo de teste nesta entrega.
- **Escala de espaçamento:** base `--space-base: 1rem (16px)`.

| Token | Valor | Uso |
|-------|-------|-----|
| `--spacing-xs` | 6px (`sm`) | Espaço entre label e input |
| `--spacing-sm` | 8px (`md`) | Padding interno de botão `sm` |
| `--spacing-md` | 12px (`lg`) | Espaço entre campos de um mesmo grupo (ex.: linha de um sócio) |
| `--spacing-lg` | 20px (`2xl`) | Espaço entre grupos de campos (ex.: entre "Dados do cliente" e "Sócios") |
| `--spacing-xl` | 32px (`4xl`) | Margem de layout da página |

Raio de borda: `--radius: 16px` (base), controles (`input`, `button`) usam a escala derivada (`md` 6px).

---

## 5. Componentes

### Formulário (Input, Select, Button)

**Quando usar:** login, criar usuário, incluir/editar cliente PF/PJ.

**Variantes:**
- `Input` com `MaskInput` (`react-imask`): CPF, CNPJ, telefone, data — máscara impede o mesmo problema do "campo livre" da planilha.
- `Select`: tipo de cliente (Pessoa Física / Pessoa Jurídica).
- `Button` primary: ação de confirmação (Entrar, Criar usuário, Salvar cliente); `Button` secondary: Cancelar; `Button` ghost + ícone: remover linha de sócio.

**Estados:** default | hover | active | disabled | loading | error (herdados do primitivo existente — não redefinidos aqui).

### Lista dinâmica de sócios (novo padrão — DDR-001)

**Quando usar:** cadastro de cliente Pessoa Jurídica.

**Variantes:**
- Linha de sócio: `Input` (nome completo) + `Input` com máscara (CPF) + `Button` ghost ícone "remover".
- Rodapé da lista: `Button` secondary "Adicionar sócio" — sem limite de linhas (ver DDR-001).

**Estados:** vazio (nenhum sócio ainda — bloqueia submit, ver `docs/solution/cadastro-clientes-solution.md` Regra de borda #5) | preenchido | erro (CPF de sócio inválido ou duplicado na mesma lista).

### Tabela de listagem (Table)

**Quando usar:** lista de clientes (busca + ações); lista somente leitura de usuários existentes na tela "Gestão de usuários".

**Variantes:** com ações por linha (Editar/Excluir) para clientes; somente leitura (sem ações) para usuários.

**Estados:** idle com dados | loading | vazio ("Nenhum cliente cadastrado" / "Nenhum usuário cadastrado") | erro ao carregar.

### Diálogo de confirmação (AlertDialog)

**Quando usar:** confirmar exclusão de cliente.

**Exemplo:**
```
AlertDialog: "Excluir cliente [nome]?" — Button secondary "Cancelar" + Button destructive "Excluir"
```

---

## 6. Padrões de Interação

| Padrão | Descrição | Animação |
|--------|-----------|----------|
| Submit de formulário | Botão primary entra em estado `loading` (spinner interno), demais campos ficam `disabled` até a resposta | `transition-colors` padrão do primitivo |
| Erro de validação de campo | Borda do campo em `destructive-border`, mensagem `caption` abaixo do campo em `destructive-foreground` | sem animação |
| Exclusão/erro de sessão | Toast (`sonner`) | `fade-in` padrão do toast do design system |

**Feedback visual:**
- Sucesso: toast de sucesso ("Cliente cadastrado com sucesso.", "Usuário criado com sucesso.")
- Erro: toast ou mensagem inline de campo, conforme a origem (erro de negócio = toast; erro de campo = inline)
- Loading: estado `loading` do botão de ação + tabela com skeleton/placeholder ao carregar a listagem

---

## 7. Acessibilidade

- **Contraste mínimo:** WCAG 2.1 AA — já garantido pelo design system (`design-system-common.md`).
- **Foco visível:** `ring` do token (`ring-offset-2`), herdado dos primitivos Radix.
- **Leitores de tela:** `aria-label` obrigatório em botão icon-only (ex.: remover sócio); labels de formulário via `htmlFor`/`id`; mensagem de erro associada ao campo (`aria-describedby`).
- **Internacionalização:** fora de escopo — sistema interno, pt-BR apenas (sem decisão a tomar nesta entrega).
- **Tamanho mínimo de toque:** não aplicável — plataforma-alvo é desktop, sem touch.

---

## 8. Decision Records de Design (DDR)

| DDR | Decisão |
|-----|---------|
| [DDR-001](../decisions/DDR-001-lista-dinamica-de-socios.md) | Lista dinâmica de sócios (adicionar/remover linha, sem limite) no cadastro de cliente PJ, composta a partir de primitivos existentes |

---

## 9. Referências

- Design System base: `governance/guidelines/frontend/nextjs/design-system.md` + `governance/guidelines/frontend/_shared/design-system-common.md`
- Figma/Protótipo: `docs/design/cadastro-clientes/prototypes/` (gerado pelo agente prototipador nesta etapa)
- Inspirações: nenhuma externa — reaproveita o padrão visual do `transacional-ibanking-web` (fonte do design system)

---

## Inventário de telas

| ID | Nome | Fluxo(s) de `/solution` atendido(s) | Persona | Rota sugerida |
| --- | --- | --- | --- | --- |
| T1 | Login | Login | Admin global, Usuário | `/login` |
| T2 | Gestão de usuários | Admin global cria usuário (+ lista somente leitura dos já criados) | Admin global | `/usuarios` |
| T3 | Lista de clientes | — (ponto de entrada para incluir/editar/excluir) | Usuário | `/clientes` |
| T4 | Incluir/editar cliente | Incluir cliente, Editar cadastro de cliente | Usuário | `/clientes/novo`, `/clientes/:id/editar` |
| T5 | Confirmar exclusão (diálogo sobre T3) | Excluir cadastro de cliente | Usuário | — (modal sobre `/clientes`) |

## Fluxos de navegação

- **Happy path Admin global:** T1 (login) → T2 (criar usuário, CPF + senha) → confirmação de criação, lista de usuários em T2 atualizada.
- **Happy path Usuário:** T1 (login) → T3 (lista de clientes) → T4 (incluir cliente PF ou PJ) → confirmação → volta para T3 com o novo cliente na lista.
- **Fluxo de erro crítico:** T1 com credencial inválida → permanece em T1 com mensagem de erro genérica (não revela se o CPF existe, conforme `docs/solution/cadastro-clientes-solution.md`).

## Estados por tela

| Tela | idle | loading | preenchido | erro | sucesso | vazio |
| --- | --- | --- | --- | --- | --- | --- |
| T1 Login | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | — (navega para T2/T3) | não se aplica |
| T2 Gestão de usuários | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório (nenhum usuário além do atual) |
| T3 Lista de clientes | ✔ obrigatório | ✔ obrigatório | não se aplica | ✔ obrigatório (falha ao carregar) | não se aplica | ✔ obrigatório (nenhum cliente cadastrado) |
| T4 Incluir/editar cliente | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório | ✔ obrigatório (lista de sócios vazia, PJ) |
| T5 Confirmar exclusão | ✔ obrigatório | ✔ obrigatório | não se aplica | ✔ obrigatório (cliente já excluído por outra sessão) | ✔ obrigatório | não se aplica |

## Decisões em aberto

| Questão | Opções | Impacto |
| --- | --- | --- |
| Layout de T4 para PJ: sócios em lista vertical simples ou em cartões por sócio | A) lista vertical de linhas (nome + CPF + remover) — mais compacta; B) um card por sócio | Protótipo explora a Opção A por ser mais compacta e consistente com o padrão de formulário já usado no design system; `/prd` pode fechar com critério de aceite se o demandante preferir B |

## Escopo do protótipo

- Telas: T1, T2, T3, T4 (estado PF e estado PJ), T5.
- Estados obrigatórios no protótipo HTML: idle, preenchido, erro e vazio das tabelas (T2/T3); loading pode ser representado estaticamente (um frame do spinner), já que o protótipo é estático.
- Uma variação de layout por tela (sem exploração de variação cosmética adicional nesta rodada).

---

## Fora deste artefato — regras negativas

- **Requisito numerado, critério de aceite, cenário Gherkin** → `/prd`.
- **Modelagem de dados, endpoint, protocolo** → `/techspec`.
- **Nova decisão de paleta/tipografia/navegação** — não há: este artefato reutiliza a coleção `frontend/nextjs` existente.
