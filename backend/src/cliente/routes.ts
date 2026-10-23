import { Router, type RequestHandler } from 'express';
import { exigirSessao } from '../middlewares/autenticacao';
import { clienteSchema } from './schema';
import {
  criarClienteService,
  editarCliente,
  excluirCliente,
  incluirCliente,
  listarClientes,
  obterCliente,
  type ClienteRepositorio,
} from './service';

type ClienteService = ReturnType<typeof criarClienteService>;

// Factory para injeção de dependência (governance/guidelines/backend/node/testing.md §2-3) —
// `clienteRouter` (módulo) é `criarClienteRouter(serviceReal, exigirSessaoReal)`, o caso real.
export function criarClienteRouter(service: ClienteService, exigirSessaoMw: RequestHandler): Router {
  const router = Router();

  router.use(exigirSessaoMw);

  router.post('/', (req, res, next) => {
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
      const cliente = service.incluirCliente(resultado.data);
      res.status(201).location(`/v1/clientes/${cliente.id}`).json(cliente);
    } catch (erro) {
      next(erro);
    }
  });

  router.get('/', (_req, res) => {
    res.status(200).json(service.listarClientes());
  });

  router.get('/:id', (req, res, next) => {
    try {
      res.status(200).json(service.obterCliente(req.params.id));
    } catch (erro) {
      next(erro);
    }
  });

  router.put('/:id', (req, res, next) => {
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
      res.status(200).json(service.editarCliente(req.params.id, resultado.data));
    } catch (erro) {
      next(erro);
    }
  });

  router.delete('/:id', (req, res, next) => {
    try {
      service.excluirCliente(req.params.id);
      res.status(204).end();
    } catch (erro) {
      next(erro);
    }
  });

  return router;
}

export const clienteRouter = criarClienteRouter(
  { incluirCliente, listarClientes, obterCliente, editarCliente, excluirCliente },
  exigirSessao,
);

export type { ClienteRepositorio };
