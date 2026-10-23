import { Router } from 'express';
import { z } from 'zod';
import { exigirAdminGlobal, exigirSessao } from '../middlewares/autenticacao';
import { criarUsuario, listarUsuarios } from './service';

export const usuarioRouter = Router();

usuarioRouter.use(exigirSessao, exigirAdminGlobal);

const corpoCriarUsuario = z.object({
  cpf: z.string().min(1),
  senha: z.string().min(8, 'senha deve ter no mínimo 8 caracteres'),
});

usuarioRouter.post('/', (req, res, next) => {
  const resultado = corpoCriarUsuario.safeParse(req.body);
  if (!resultado.success) {
    res.status(400).type('application/problem+json').json({
      type: 'urn:cadastro-clientes:erro:validacao',
      title: 'validacao',
      status: 400,
      detail: 'cpf e senha (mínimo 8 caracteres) são obrigatórios.',
      errors: resultado.error.issues.map((issue) => ({
        field: String(issue.path[0]),
        message: issue.message,
      })),
      traceId: req.correlationId,
    });
    return;
  }

  try {
    const usuario = criarUsuario(resultado.data.cpf, resultado.data.senha);
    res.status(201).location(`/v1/usuarios/${usuario.id}`).json(usuario);
  } catch (erro) {
    next(erro);
  }
});

usuarioRouter.get('/', (_req, res) => {
  res.status(200).json(listarUsuarios());
});
