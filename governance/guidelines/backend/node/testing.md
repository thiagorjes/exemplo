# Testes — Backend Node

## 1. Estratégia

| Camada | Ferramenta | Foco |
|---|---|---|
| `routes` | Supertest + `app.ts` (sem `listen`) | Contrato HTTP: request válido → response, status, corpo campo a campo |
| `service` | Jest, repository em memória (dublê simples, sem lib de mock) | Regra de negócio isolada |
| `repository` | `node:sqlite` em arquivo temporário (`:memory:`) | Queries e constraints reais do SQLite |

Sem WireMock nem integração externa nesta demo: o backend `node` não chama API de terceiro.

## 2. Rotas com Supertest

Obrigatório validar **cada campo** da resposta, não só o status:

```ts
import request from 'supertest';
import { criarApp } from '../src/app';

test('cadastra cliente com sucesso', async () => {
  const app = criarApp({ clienteRepository: repositorioDeTeste() });

  const resposta = await request(app)
    .post('/v1/clientes')
    .send({ nome: 'Maria Silva', email: 'maria@email.com', cpf: '12345678900' });

  expect(resposta.status).toBe(201);
  expect(resposta.body.id).toEqual(expect.any(String));
  expect(resposta.body.nome).toBe('Maria Silva');
  expect(resposta.body.email).toBe('maria@email.com');
  expect(resposta.headers.location).toBe(`/v1/clientes/${resposta.body.id}`);
});
```

Erro de negócio e de validação travam o contrato igual — status, `type` da categoria,
`codigoRegra`/`dadosApoio` ou `errors[0].field`/`errors[0].message`:

```ts
test('rejeita e-mail duplicado', async () => {
  const resposta = await request(app).post('/v1/clientes').send(clienteExistente);

  expect(resposta.status).toBe(409);
  expect(resposta.body.type).toBe('urn:demo-idsd:erro:regra-negocio');
  expect(resposta.body.codigoRegra).toBe('RN-CLI-01');
  expect(resposta.body.dadosApoio.email).toBe(clienteExistente.email);
});
```

## 3. Service com dublê de repository

Sem lib de mock (`jest.fn()` do próprio Jest basta): dublê simples que implementa a mesma
interface do repository real, guardando estado num array/Map em memória.

```ts
test('recusa cadastro com CPF já usado', async () => {
  const repo = repositorioDeTeste([{ id: '1', cpf: '12345678900', email: 'a@a.com', nome: 'A' }]);
  const service = criarClienteService(repo);

  await expect(service.cadastrar({ nome: 'B', email: 'b@b.com', cpf: '12345678900' }))
    .rejects.toThrow(ConflitoError);
});
```

## 4. Repository com `node:sqlite` em arquivo temporário

```ts
import { DatabaseSync } from 'node:sqlite';

let db: DatabaseSync;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  aplicarMigrations(db); // mesmos scripts de src/db/migrations
});

test('persiste cliente e recupera por id', () => {
  const repo = criarClienteRepository(db);
  const criado = repo.inserir({ nome: 'Teste', email: 'teste@email.com', cpf: '00000000000' });

  expect(repo.buscarPorId(criado.id)?.nome).toBe('Teste');
});
```

Base de teste nasce vazia a cada teste (`:memory:` novo) — mesma regra de higiene de
`backend/java/testing.md` §4.1, sem precisar de schema dedicado (cada teste já tem o seu).

## 5. Protocolo para a IA

1. **Asserts exaustivos** em `routes` — todo campo relevante da resposta, não só o status.
2. **Simplicidade** — teste é `Monta request → Checa response`; sem lógica condicional no teste.
3. Dublê de repository implementa a interface real; nunca mocka o Express.
4. Toda regra de negócio nova tem teste de sucesso **e** de violação (pelo menos um por
   `codigoRegra`).

## Cobertura

- Jest `--coverage`; meta **> 80%** (recomendado — ver [`definition-of-done.md`](definition-of-done.md)).
- Cobrir fluxo principal de login e de cadastro + casos de erro de cada um.

## Checklist

- [ ] Toda rota nova com teste Supertest cobrindo sucesso e pelo menos um erro, campo a campo
- [ ] Toda regra de negócio com teste de sucesso e de violação
- [ ] Repository testado contra `node:sqlite` real (`:memory:`), não contra dublê
- [ ] `npm test` sem teste pulado (`.skip`) na branch principal
