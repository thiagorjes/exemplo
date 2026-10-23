import { Router } from 'express';
import { exigirSessao } from '../middlewares/autenticacao';
import { clienteSchema } from './schema';
import { incluirCliente, listarClientes } from './service';

export const clienteRouter = Router();

clienteRouter.use(exigirSessao);

clienteRouter.post('/', (req, res, next) => {
  const resultado = clienteSchema.safeParse(req.body);
  if (!resultado.success) {
    res.status(400).type('application/problem+json').json({
      type: 'urn:cadastro-clientes:erro:validacao',
      title: 'validacao',
      status: 400,
      detail: 'Dados do cliente inválidos ou incompletos.',
      errors: resultado.error.issues.map((issue) => ({
        field: String(issue.path[0]),
        message: issue.message,
      })),
      traceId: req.correlationId,
    });
    return;
  }

  try {
    const cliente = incluirCliente(resultado.data);
    res.status(201).location(`/v1/clientes/${cliente.id}`).json(cliente);
  } catch (erro) {
    next(erro);
  }
});

clienteRouter.get('/', (_req, res) => {
  res.status(200).json(listarClientes());
});
