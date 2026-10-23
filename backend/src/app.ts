import express, { type Express } from 'express';
import { errorHandler } from './middlewares/error-handler';
import { requestId } from './middlewares/request-id';
import { criarExigirSessao, exigirSessao } from './middlewares/autenticacao';
import { criarSessaoRouter } from './sessao/routes';
import { criarLogout, logout } from './sessao/service';
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
  sessaoRepository?: {
    // substitui `validarSessao` real no middleware de autenticação.
    validar?(id: string): { usuarioId: string; papel: 'admin_global' | 'usuario' };
    // substitui `encerrarSessao` real no logout.
    encerrar?(id: string): void;
  };
}

// Factory para injeção de dependência (governance/guidelines/backend/node/testing.md §2-3) —
// `app` (módulo, usado por `server.ts`) é `criarApp()`, sem overrides.
export function criarApp(deps: AppDeps = {}): Express {
  const app = express();

  app.use(express.json());
  app.use(requestId);

  const exigirSessaoMw = deps.sessaoRepository?.validar
    ? criarExigirSessao((id) => deps.sessaoRepository!.validar!(id))
    : exigirSessao;

  const logoutFn = deps.sessaoRepository?.encerrar
    ? criarLogout({ encerrar: deps.sessaoRepository.encerrar })
    : logout;

  const clienteService = deps.clienteRepository
    ? criarClienteService(deps.clienteRepository)
    : { incluirCliente, listarClientes, obterCliente, editarCliente, excluirCliente };

  app.use('/v1/sessoes', criarSessaoRouter(logoutFn));
  app.use('/v1/usuarios', usuarioRouter);
  app.use('/v1/clientes', criarClienteRouter(clienteService, exigirSessaoMw));

  app.use(errorHandler);

  return app;
}

export const app = criarApp();
