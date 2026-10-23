import { ConflitoError, RecursoNaoEncontradoError } from '../core/errors';
import {
  atualizarCliente as atualizarClienteRepo,
  buscarPorDocumento,
  buscarPorId,
  inserirCliente,
  listarAtivos,
  marcarExcluido,
} from './repository';
import type { Cliente, DadosCliente } from './model';

export function incluirCliente(dados: DadosCliente): Cliente {
  if (buscarPorDocumento(dados.documento)) {
    throw new ConflitoError('Documento já cadastrado para outro cliente.', 'RN-CLI-01');
  }

  return inserirCliente(dados);
}

export function listarClientes(): Cliente[] {
  return listarAtivos();
}

export function obterCliente(id: string): Cliente {
  const encontrado = buscarPorId(id);

  if (!encontrado) {
    throw new RecursoNaoEncontradoError('Cliente não encontrado.', 404);
  }
  if (encontrado.excluidoEm) {
    throw new RecursoNaoEncontradoError('Cliente foi excluído.', 410);
  }

  return encontrado.cliente;
}

export function editarCliente(id: string, dados: DadosCliente): Cliente {
  obterCliente(id);
  return atualizarClienteRepo(id, dados);
}

export function excluirCliente(id: string): void {
  const encontrado = buscarPorId(id);

  if (!encontrado) {
    throw new RecursoNaoEncontradoError('Cliente não encontrado.', 404);
  }

  marcarExcluido(id);
}
