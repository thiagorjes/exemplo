import { Router } from 'express';
import { z } from 'zod';
import { login, logout, validarSessao } from './service';

const corpoLogin = z.object({
  cpf: z.string().min(1),
  senha: z.string().min(1),
});

// Factory para injeção de dependência (governance/guidelines/backend/node/testing.md §2-3) —
// `sessaoRouter` (módulo) é `criarSessaoRouter(logout)`, o caso real. `login`/`validarSessao`
// não são injetados aqui porque nenhum teste de `/tests` exige dublê para eles.
export function criarSessaoRouter(logoutFn: typeof logout): Router {
  const router = Router();

  router.post('/', (req, res, next) => {
    const resultado = corpoLogin.safeParse(req.body);
    if (!resultado.success) {
      res.status(400).type('application/problem+json').json({
        type: 'urn:cadastro-clientes:erro:validacao',
        title: 'validacao',
        status: 400,
        detail: 'cpf e senha são obrigatórios.',
        errors: resultado.error.issues.map((issue) => ({
          field: String(issue.path[0]),
          message: issue.message,
        })),
        traceId: req.correlationId,
      });
      return;
    }

    try {
      const sessao = login(resultado.data.cpf, resultado.data.senha);
      res.status(201).location(`/v1/sessoes/${sessao.id}`).json(sessao);
    } catch (erro) {
      next(erro);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const sessao = validarSessao(req.params.id);
      res.status(200).json(sessao);
    } catch (erro) {
      next(erro);
    }
  });

  router.delete('/:id', (req, res) => {
    logoutFn(req.params.id);
    res.status(204).end();
  });

  return router;
}

export const sessaoRouter = criarSessaoRouter(logout);
