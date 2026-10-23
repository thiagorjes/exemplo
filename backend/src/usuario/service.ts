import { gerarHash } from '../core/senha';
import { ConflitoError } from '../core/errors';
import { buscarUsuarioPorCpf, criarUsuario as criarUsuarioRepo, listarUsuarios as listarUsuariosRepo } from './repository';
import type { UsuarioCriado, UsuarioResumo } from './model';

export function criarUsuario(cpf: string, senha: string): UsuarioCriado {
  if (buscarUsuarioPorCpf(cpf)) {
    throw new ConflitoError('CPF já cadastrado para outro usuário.', 'RN-USU-01');
  }

  return criarUsuarioRepo({ cpf, senhaHash: gerarHash(senha) });
}

export function listarUsuarios(): UsuarioResumo[] {
  return listarUsuariosRepo();
}
