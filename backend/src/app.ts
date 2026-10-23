import express, { type Express } from 'express';
import { errorHandler } from './middlewares/error-handler';
import { requestId } from './middlewares/request-id';
import { criarExigirSessao, exigirSessao } from './middlewares/autenticacao';
import { sessaoRouter } from './sessao/routes';
import { usuarioRouter } from './usuario/routes';
import { criarClienteRouter, type ClienteRepositorio } from './cliente/routes';
import {
  criarClienteService,
  editarCliente,
  excluirCliente,
  incluirCliente,
  listarClientes,
  obterCliente,
} from './cliente/service';

export interface AppDeps {
  clienteRepository?: ClienteRepositorio;
  // `sessaoRepository.validar` substitui `validarSessao` real no middleware de autenticação —
  // dublê de teste (governance/guidelines/backend/node/testing.md §2-3).
  sessaoRepository?: { validar(id: string): { usuarioId: string; papel: 'admin_global' | 'usuario' } };
}

// Factory para injeção de dependência (governance/guidelines/backend/node/testing.md §2-3) —
// `app` (módulo, usado por `server.ts`) é `criarApp()`, sem overrides.
export function criarApp(deps: AppDeps = {}): Express {
  const app = express();

  app.use(express.json());
  app.use(requestId);

  const exigirSessaoMw = deps.sessaoRepository
    ? criarExigirSessao((id) => deps.sessaoRepository!.validar(id))
    : exigirSessao;

  const clienteService = deps.clienteRepository
    ? criarClienteService(deps.clienteRepository)
    : { incluirCliente, listarClientes, obterCliente, editarCliente, excluirCliente };

  app.use('/v1/sessoes', sessaoRouter);
  app.use('/v1/usuarios', usuarioRouter);
  app.use('/v1/clientes', criarClienteRouter(clienteService, exigirSessaoMw));

  app.use(errorHandler);

  return app;
}

export const app = criarApp();
