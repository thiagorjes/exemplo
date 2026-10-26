# Contrato — Usuário

> API Node (`/v1/usuarios`). Exclusivo do papel `admin_global` (RN-006) — toda rota exige sessão
> válida (`GET /v1/sessoes/{id}`, ver `sessao.md`) **e** `papel === 'admin_global'`. Materializa
> RF-002, RF-003, RN-001, RN-002, RN-003, RN-006.

## `POST /v1/usuarios` — Criar usuário

- **Request:** `{ cpf: string, senha: string }`
- **201 Created** — `Location: /v1/usuarios/{id}` — corpo: `{ id, cpf, papel: 'usuario', criadoEm }`
  (nunca a senha nem o hash)
- **400** (`errors[]`) — `senha` com menos de 8 caracteres (RN-003); `cpf` fora do formato
- **403** (`type: urn:cadastro-clientes:erro:sem-permissao`) — sessão válida, mas `papel !== 'admin_global'`
  (RN-006, SCN-002.3)
- **409** (`type: urn:cadastro-clientes:erro:regra-negocio`, `codigoRegra: RN-USU-01`,
  `dadosApoio: { cpf }`) — CPF já pertence a um usuário existente (RN-002, SCN-002.2)

> Todo usuário criado por esta rota nasce com `papel = 'usuario'`. Não há rota para criar um
> segundo `admin_global` nesta demo (fora do escopo aprovado — ver Shape Brief, "Hierarquia
> entre gestores/admins" como fora de escopo). O primeiro `admin_global` nasce pelo script de
> seed (`quickstart.md`), não por esta rota.

## `GET /v1/usuarios` — Listar usuários (somente leitura)

- **200** — `[{ id, cpf, papel, criadoEm }, ...]` — sem paginação nesta demo (RNF-004: volume de
  dezenas de usuários)
- **403** — mesma regra do `POST` acima (RF-003, SCN-003.3)

Sem `PUT`/`DELETE` nesta entrega — edição e desativação de usuário estão fora do escopo
aprovado no Shape Brief.
