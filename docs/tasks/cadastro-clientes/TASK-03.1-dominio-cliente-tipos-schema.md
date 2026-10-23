### TASK-03.1 — Domínio cliente: tipos e schema de validação [api]

- **Status:** pendente
- **Sistema:** api
- **Executor:** agente
- **Tentativas:** 3
- **Depende de:** TASK-01.2
- **Cenários cobertos:** SCN-004.3, SCN-005.3
- **Origem:** `docs/techspec/cadastro-clientes/data-model.md`; `docs/techspec/cadastro-clientes/contracts/cliente.md`

#### Contexto

Define o formato de dado de cliente (PF e PJ) e a validação de entrada — base para
repository, service e rotas das próximas tasks deste épico.

#### O que deve ser feito

- [ ] Criar `backend/src/cliente/model.ts`:
      ```ts
      export type ClientePF = {
        id: string; tipo: 'PF'; documento: string; nomeCompleto: string;
        dataNascimento: string; endereco: string; telefone: string;
        criadoEm: string; atualizadoEm: string;
      };
      export type ClientePJ = {
        id: string; tipo: 'PJ'; documento: string; nomeFantasia: string;
        razaoSocial: string; dataAbertura: string; endereco: string; telefone: string;
        socios: { nomeCompleto: string; cpf: string }[];
        criadoEm: string; atualizadoEm: string;
      };
      export type Cliente = ClientePF | ClientePJ;
      ```
- [ ] Criar `backend/src/cliente/schema.ts` (Zod, união discriminada por `tipo`):
      ```ts
      const socioSchema = z.object({ nomeCompleto: z.string().min(1), cpf: z.string().length(11) });
      const pfSchema = z.object({
        tipo: z.literal('PF'), documento: z.string().length(11),
        nomeCompleto: z.string().min(1), dataNascimento: z.string().min(1),
        endereco: z.string().min(1), telefone: z.string().min(1),
      });
      const pjSchema = z.object({
        tipo: z.literal('PJ'), documento: z.string().length(14),
        nomeFantasia: z.string().min(1), razaoSocial: z.string().min(1),
        dataAbertura: z.string().min(1), endereco: z.string().min(1), telefone: z.string().min(1),
        socios: z.array(socioSchema).min(1),
      });
      export const clienteSchema = z.discriminatedUnion('tipo', [pfSchema, pjSchema]);
      ```

#### Guia técnico — estrutura de arquivos

| Arquivo | Ação | Observação |
| --- | --- | --- |
| `backend/src/cliente/model.ts` | criar | tipos `ClientePF`, `ClientePJ`, `Cliente` |
| `backend/src/cliente/schema.ts` | criar | `clienteSchema` (Zod discriminated union) |

**Proibido tocar:** `docs/prd/cadastro-clientes/*.feature`, `backend/test/`.

#### Guia técnico — padrão a seguir

Referência viva: `docs/techspec/cadastro-clientes/data-model.md` (colunas de `clientes` e
`socios`, literal) e `docs/techspec/cadastro-clientes/contracts/cliente.md` (campos exatos do
`POST /v1/clientes`, PF e PJ).

#### Guia técnico — pontos de atenção

- `socios: z.array(socioSchema).min(1)` é a validação que cobre SCN-005.3 (PJ sem nenhum
  sócio) — é erro de schema (`400`), não regra de negócio no service (RN-008 já citada no
  PRD como procedência, mas o mecanismo de verificação é o schema, não um `if` manual).
- Não trocar o nome dos campos — `nomeCompleto`, `dataNascimento`, `nomeFantasia`,
  `razaoSocial`, `dataAbertura` são os nomes exatos do contrato.

#### Critérios de aceite

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | `clienteSchema.parse(...)` aceita o payload PF do exemplo RF-004 em `quickstart.md` | teste manual (script Node) |
| 2 | `clienteSchema.parse(...)` rejeita PJ com `socios: []` ou sem o campo `socios` | teste manual |
| 3 | `clienteSchema.parse(...)` rejeita `tipo` diferente de `'PF'`/`'PJ'` | teste manual |

#### Histórico

| Data | Evento | Detalhe |
| --- | --- | --- |
| 2026-10-22 | decisão | Task criada por `/tasks`, campos copiados literalmente do contrato. |
