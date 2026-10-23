import request from 'supertest';
import { criarApp } from '../../src/app';

/**
 * SCN-009.3 — Logout acionado duas vezes em sequência (docs/prd/cadastro-clientes-prd.md,
 * RF-009). Contrato: `DELETE /v1/sessoes/{id}` é 204 sempre, idempotente por design, mesmo com
 * a sessão já encerrada (docs/techspec/cadastro-clientes/contracts/sessao.md).
 */

function repositorioDeTeste(sessoes: { id: string; encerradaEm: string | null }[]) {
  return {
    buscarPorId: (id: string) => sessoes.find((s) => s.id === id) ?? null,
    encerrar: (id: string) => {
      const sessao = sessoes.find((s) => s.id === id);
      if (sessao) sessao.encerradaEm = new Date().toISOString();
    },
  };
}

test('SCN-009.3 — a segunda chamada também encerra como sessão já encerrada, sem erro', async () => {
  const sessoes = [{ id: 'sessao-1', encerradaEm: null }];
  const app = criarApp({ sessaoRepository: repositorioDeTeste(sessoes) } as never);

  const primeiroLogout = await request(app).delete('/v1/sessoes/sessao-1');
  expect(primeiroLogout.status).toBe(204);

  const segundoLogout = await request(app).delete('/v1/sessoes/sessao-1');
  expect(segundoLogout.status).toBe(204);
});

test('SCN-009.3 (variação) — duas chamadas disparadas em paralelo, nenhuma falha', async () => {
  const sessoes = [{ id: 'sessao-2', encerradaEm: null }];
  const app = criarApp({ sessaoRepository: repositorioDeTeste(sessoes) } as never);

  const [respostaA, respostaB] = await Promise.all([
    request(app).delete('/v1/sessoes/sessao-2'),
    request(app).delete('/v1/sessoes/sessao-2'),
  ]);

  expect(respostaA.status).toBe(204);
  expect(respostaB.status).toBe(204);
});
