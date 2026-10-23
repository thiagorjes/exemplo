import { conferirSenha } from '../core/senha';
import { RegraNegocioError } from '../core/errors';
import { config } from '../config';
import { buscarSessaoPorId, criarSessao, encerrarSessao, tocarSessao } from './repository';
import { buscarUsuarioPorCpf } from '../usuario/repository';
import type { SessaoCriada, SessaoValidada } from './model';

// Interface simplificada para injeção de dependência em teste
// (governance/guidelines/backend/node/testing.md §2-3, `criarApp({ sessaoRepository })`).
export interface SessaoLogoutRepositorio {
  encerrar(id: string): void;
}

const repositorioLogoutReal: SessaoLogoutRepositorio = {
  encerrar: (id) => encerrarSessao(id),
};

export function criarLogout(repo: SessaoLogoutRepositorio) {
  // Idempotente por design (RF-009, SCN-009.2 e SCN-009.3) — nunca checa antes se a sessão
  // existe, já está encerrada ou já expirou.
  return function logout(id: string): void {
    repo.encerrar(id);
  };
}

// Mensagem e status idênticos para CPF inexistente e senha errada — qualquer diferença
// (texto ou tempo de resposta perceptível) quebra SCN-001.2.
function erroAutenticacao(): RegraNegocioError {
  return new RegraNegocioError('CPF ou senha inválidos.', 401);
}

export function login(cpf: string, senha: string): SessaoCriada {
  const usuario = buscarUsuarioPorCpf(cpf);

  if (!usuario || !conferirSenha(senha, usuario.senhaHash)) {
    throw erroAutenticacao();
  }

  return criarSessao(usuario.id, usuario.papel);
}

export function validarSessao(id: string): SessaoValidada {
  const sessao = buscarSessaoPorId(id);

  if (!sessao || sessao.encerradaEm !== null) {
    throw erroAutenticacao();
  }

  const inativaDesde = Date.now() - new Date(sessao.ultimaAtividadeEm).getTime();
  if (inativaDesde >= config.SESSION_IDLE_TIMEOUT_MS) {
    throw erroAutenticacao();
  }

  tocarSessao(id);

  return {
    id: sessao.id,
    usuarioId: sessao.usuarioId,
    papel: sessao.papel,
    ultimaAtividadeEm: new Date().toISOString(),
  };
}

export const logout = criarLogout(repositorioLogoutReal);
