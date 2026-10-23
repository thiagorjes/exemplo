import { ConflitoError, RecursoNaoEncontradoError, RegraNegocioError } from '../core/errors';
import {
  atualizarCliente,
  buscarPorDocumento,
  buscarPorId,
  inserirCliente,
  listarAtivos,
  marcarExcluido,
} from './repository';
import type { Cliente, DadosCliente } from './model';

// Interface simplificada (dublê de teste, governance/guidelines/backend/node/testing.md §2-3,
// `criarApp({ clienteRepository })`) — `buscarPorId` devolve o cliente já achatado com
// `excluidoEm` na própria forma, ao contrário de `repository.ts` real (`{ cliente, excluidoEm }`).
export interface ClienteRepositorio {
  buscarPorId(id: string): (Cliente & { excluidoEm: string | null }) | null | undefined;
  atualizar(id: string, dados: DadosCliente): Cliente;
  listar(): Cliente[];
  inserir(dados: DadosCliente): Cliente;
  excluir(id: string): void;
  buscarPorDocumento?(documento: string): Cliente | null | undefined;
}

const repositorioReal: ClienteRepositorio = {
  buscarPorId: (id) => {
    const encontrado = buscarPorId(id);
    return encontrado ? { ...encontrado.cliente, excluidoEm: encontrado.excluidoEm } : null;
  },
  atualizar: (id, dados) => atualizarCliente(id, dados),
  listar: () => listarAtivos(),
  inserir: (dados) => inserirCliente(dados),
  excluir: (id) => marcarExcluido(id),
  buscarPorDocumento: (documento) => buscarPorDocumento(documento),
};

export function criarClienteService(repo: ClienteRepositorio) {
  function incluirCliente(dados: DadosCliente): Cliente {
    if (repo.buscarPorDocumento?.(dados.documento)) {
      throw new ConflitoError('Documento já cadastrado para outro cliente.', 'RN-CLI-01');
    }

    return repo.inserir(dados);
  }

  function listarClientes(): Cliente[] {
    return repo.listar();
  }

  function obterCliente(id: string): Cliente {
    const encontrado = repo.buscarPorId(id);

    if (!encontrado) {
      throw new RecursoNaoEncontradoError('Cliente não encontrado.', 404);
    }
    if (encontrado.excluidoEm) {
      throw new RecursoNaoEncontradoError('Cliente foi excluído.', 410);
    }

    const { excluidoEm: _excluidoEm, ...cliente } = encontrado;
    return cliente as Cliente;
  }

  function editarCliente(id: string, dados: DadosCliente): Cliente {
    const atual = obterCliente(id);

    if (dados.tipo !== atual.tipo) {
      throw new RegraNegocioError('Não é permitido alterar o tipo do cliente.', 400);
    }

    return repo.atualizar(id, dados);
  }

  function excluirCliente(id: string): void {
    if (!repo.buscarPorId(id)) {
      throw new RecursoNaoEncontradoError('Cliente não encontrado.', 404);
    }

    repo.excluir(id);
  }

  return { incluirCliente, listarClientes, obterCliente, editarCliente, excluirCliente };
}

export const { incluirCliente, listarClientes, obterCliente, editarCliente, excluirCliente } =
  criarClienteService(repositorioReal);
