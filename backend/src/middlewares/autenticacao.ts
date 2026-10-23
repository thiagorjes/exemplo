import type { NextFunction, Request, Response } from 'express';
import { RegraNegocioError } from '../core/errors';
import { validarSessao } from '../sessao/service';
import type { Papel } from '../sessao/model';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      sessao?: { usuarioId: string; papel: Papel };
    }
  }
}

type ValidadorDeSessao = (id: string) => { usuarioId: string; papel: Papel };

// Factory para injeção de dependência em teste (governance/guidelines/backend/node/testing.md
// §2-3, `criarApp({ sessaoRepository })`) — `exigirSessao` (módulo) é `criarExigirSessao(validarSessao)`,
// o caso real.
export function criarExigirSessao(validador: ValidadorDeSessao) {
  return function exigirSessao(req: Request, _res: Response, next: NextFunction): void {
    const sessaoId = req.header('X-Sessao-Id');

    if (!sessaoId) {
      next(new RegraNegocioError('Sessão ausente.', 401));
      return;
    }

    try {
      const sessao = validador(sessaoId);
      req.sessao = { usuarioId: sessao.usuarioId, papel: sessao.papel };
      next();
    } catch (erro) {
      next(erro);
    }
  };
}

export const exigirSessao = criarExigirSessao(validarSessao);

export function exigirAdminGlobal(req: Request, _res: Response, next: NextFunction): void {
  if (req.sessao?.papel !== 'admin_global') {
    next(new RegraNegocioError('Acesso restrito ao admin global.', 403));
    return;
  }
  next();
}
