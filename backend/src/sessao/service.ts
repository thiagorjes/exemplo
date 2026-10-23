import { conferirSenha } from '../core/senha';
import { RegraNegocioError } from '../core/errors';
import { config } from '../config';
import { buscarSessaoPorId, criarSessao, tocarSessao } from './repository';
import { buscarUsuarioPorCpf } from '../usuario/repository';
import type { SessaoCriada, SessaoValidada } from './model';

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
