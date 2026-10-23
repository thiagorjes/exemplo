import request from 'supertest';
import { criarApp } from '../../src/app';

/**
 * SCN-006.3 — Duas edições concorrentes no mesmo cliente (docs/prd/cadastro-clientes-prd.md,
 * RF-006). Regra de borda #3 de docs/solution/cadastro-clientes-solution.md: sem bloqueio nem
 * aviso de conflito — a última confirmação prevalece.
 *
 * Padrão de `routes` com dublê de repository, conforme
 * governance/guidelines/backend/node/testing.md §2-3 (`criarApp({ clienteRepository })`).
 */

type Cliente = {
  id: string;
  tipo: 'PF';
  documento: string;
  nomeCompleto: string;
  dataNascimento: string;
  endereco: string;
  telefone: string;
  excluidoEm: string | null;
};

function repositorioDeTeste(clientes: Cliente[]) {
  return {
    buscarPorId: (id: string) => clientes.find((c) => c.id === id) ?? null,
    atualizar: (id: string, dados: Partial<Cliente>) => {
      const cliente = clientes.find((c) => c.id === id)!;
      Object.assign(cliente, dados);
      return cliente;
    },
    listar: () => clientes.filter((c) => !c.excluidoEm),
    inserir: (dados: Omit<Cliente, 'id' | 'excluidoEm'>) => {
      const cliente: Cliente = { ...dados, id: 'cli-1', excluidoEm: null };
      clientes.push(cliente);
      return cliente;
    },
    excluir: (id: string) => {
      const cliente = clientes.find((c) => c.id === id);
      if (cliente) cliente.excluidoEm = new Date().toISOString();
    },
  };
}

function sessaoValidaDeTeste() {
  // Toda rota de /v1/clientes exige sessão válida (RN-005) — dublê simples que sempre responde
  // "sessão válida, papel usuario" para o middleware de autenticação checar.
  return { validar: (_id: string) => ({ usuarioId: 'u-1', papel: 'usuario' as const }) };
}

test('SCN-006.3 — a última confirmação prevalece, sem bloqueio nem aviso de conflito', async () => {
  const clientes: Cliente[] = [
    {
      id: 'cli-1',
      tipo: 'PF',
      documento: '11111111111',
      nomeCompleto: 'Nome Original',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
      excluidoEm: null,
    },
  ];
  const app = criarApp({
    clienteRepository: repositorioDeTeste(clientes),
    sessaoRepository: sessaoValidaDeTeste(),
  } as never);

  const primeiraEdicao = request(app)
    .put('/v1/clientes/cli-1')
    .set('X-Sessao-Id', 'sessao-teste')
    .send({
      tipo: 'PF',
      documento: '11111111111',
      nomeCompleto: 'Primeira Edição',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });

  const segundaEdicao = request(app)
    .put('/v1/clientes/cli-1')
    .set('X-Sessao-Id', 'sessao-teste')
    .send({
      tipo: 'PF',
      documento: '11111111111',
      nomeCompleto: 'Segunda Edição',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });

  const [respostaA, respostaB] = await Promise.all([primeiraEdicao, segundaEdicao]);

  // Nenhuma das duas é recusada por conflito — não há bloqueio nem versão nesta entrega.
  expect(respostaA.status).toBe(200);
  expect(respostaB.status).toBe(200);

  const final = await request(app).get('/v1/clientes/cli-1').set('X-Sessao-Id', 'sessao-teste');
  // A última chamada que o servidor processou é quem prevalece — sem bloqueio para decidir
  // qual delas "ganha" antes do tempo, o teste verifica que o estado final é consistente com
  // uma das duas (não um valor corrompido/mesclado), conforme a Regra de borda #3.
  expect(['Primeira Edição', 'Segunda Edição']).toContain(final.body.nomeCompleto);
});
