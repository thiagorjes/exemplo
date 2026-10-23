# Padrões de Código — Backend Node

> Convenções de commit: ver [`_shared/git-workflow.md`](../../_shared/git-workflow.md).
> Níveis de log: ver [`_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md).

## Nomenclatura

| Artefato | Convenção | Exemplo |
|---|---|---|
| Arquivos | kebab-case | `error-handler.ts`, `routes.ts` |
| Classes (erros) | PascalCase | `RegraNegocioError` |
| Funções / variáveis | camelCase | `buscarClientePorId`, `senhaHash` |
| Tipos / `type` | PascalCase | `ClienteRequest`, `SessaoAtiva` |
| Constantes | UPPER_SNAKE_CASE | `MAX_TENTATIVAS_LOGIN` |
| Migrations | `<NNN>_descricao_clara.sql` | `001_create_table_clientes.sql` |

## Injeção de dependência

Sem container de DI (Express não tem um nativo). Dependências explícitas por **parâmetro de
função/factory**, nunca singleton mutável nem `import` direto do driver de banco dentro do
`service`:

```ts
export function criarClienteService(repository: ClienteRepository) {
  return {
    async cadastrar(dados: ClienteInput): Promise<Cliente> { /* ... */ },
  };
}
```

`app.ts` monta o grafo (repository → service → routes) uma vez, no boot; os testes montam o
próprio grafo com um repository de teste.

## Tipos imutáveis

`type`, nunca `interface` com propriedade mutável, para todo objeto de transporte. Proibido
classe com getter/setter para DTO — só as classes de erro (`core/errors.ts`) fogem disso.

```ts
export type ClienteRequest = Readonly<{
  nome: string;
  email: string;
  cpf: string;
}>;
```

## Tratamento de erros

- Erro de negócio = classe nomeada estendendo `AppError` (`core/errors.ts`), nunca `throw new
  Error("...")` genérico.
- `AppError` carrega `status` (HTTP) e, quando a falha é de regra de negócio, `codigoRegra`
  (string `RN-XXX-NN`, mesmo formato de `backend/java/coding-standards.md`) e `dadosApoio`
  opcional.
- `catch` vazio ou que só faz `console.log` do erro é proibido — logar **ou** relançar, nunca os
  dois (mesma regra de duplicidade de log de `_shared/logging-and-levels.md` §1).
- `middlewares/error-handler.ts` é o único lugar que monta o corpo
  `application/problem+json` (formato em
  [`_shared/api-standards.md`](../../_shared/api-standards.md) §3): `type`, `title`, `status`,
  `detail` (português, sem stack nem SQL), `instance`, `traceId`, `codigoRegra`/`dadosApoio`
  quando houver, `errors[]` só no `400` de validação Zod.

```ts
throw new ConflitoError('RN-CLI-01', { email }); // 409, codigoRegra RN-CLI-01, dadosApoio { email }
```

## Logging

Pino, com `req.id` (de `X-Correlation-Id`) em todo log de request. Proibido `console.log` fora de
scripts de setup local (migrations). Mensagem com campos estruturados, nunca concatenação:

```ts
logger.warn({ clienteId, tentativas }, 'login recusado: senha incorreta');
```

Dado proibido em log (senha, hash de senha, `Authorization`, CPF sem máscara): ver
[`_shared/logging-and-levels.md`](../../_shared/logging-and-levels.md) §3 — vale integralmente,
sem exceção para esta stack.

## Lint e formatação

- ESLint (`typescript-eslint`, regras recomendadas + `no-explicit-any` como erro) e Prettier —
  verificador: `npm run lint` (CI e pre-commit).
- `any` proibido fora de teste; tipo desconhecido vindo do SQLite é tratado com `unknown` +
  checagem/validação, nunca `as any`.

## Comentários

Zero comentário explicando **o quê**. Comente só o **porquê** quando não for óbvio (mesma regra
de `_shared/architecture-principles.md` §8).

## Checklist

- [ ] Nomenclatura conforme tabela
- [ ] Dependências por parâmetro/factory — sem singleton mutável, sem import direto do driver no `service`
- [ ] `type` imutável para todo DTO; sem classe com getter/setter fora de `core/errors.ts`
- [ ] Erros nomeados estendendo `AppError`, com `status` e `codigoRegra` quando for regra de negócio; sem `catch` vazio
- [ ] Pino em todo log; sem `console.log` fora de script de setup; sem dado proibido em log
- [ ] `npm run lint` sem erro; sem `any` fora de teste
