import { Router } from 'express';
import { z } from 'zod';
import { login, validarSessao } from './service';

export const sessaoRouter = Router();

const corpoLogin = z.object({
  cpf: z.string().min(1),
  senha: z.string().min(1),
});

sessaoRouter.post('/', (req, res, next) => {
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
    res
      .status(201)
      .location(`/v1/sessoes/${sessao.id}`)
      .json(sessao);
  } catch (erro) {
    next(erro);
  }
});

sessaoRouter.get('/:id', (req, res, next) => {
  try {
    const sessao = validarSessao(req.params.id);
    res.status(200).json(sessao);
  } catch (erro) {
    next(erro);
  }
});
