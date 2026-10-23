import type { NextFunction, Request, Response } from 'express';
import { ConflitoError, RecursoNaoEncontradoError, RegraNegocioError } from '../core/errors';

interface CorpoProblema {
  type: string;
  title: string;
  status: number;
  detail: string;
  codigoRegra?: string;
  traceId: string;
}

const PREFIXO_URN = 'urn:cadastro-clientes:erro';

function categoria(status: number): string {
  if (status === 404 || status === 410) return 'nao-encontrado';
  if (status === 409) return 'conflito';
  if (status === 401) return 'nao-autenticado';
  if (status === 403) return 'sem-permissao';
  if (status === 400) return 'validacao';
  return 'regra-negocio';
}

// Único lugar que monta o corpo application/problem+json — nenhuma rota monta esse corpo
// diretamente (governance/guidelines/backend/node/architecture.md §5).
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  const traceId = req.correlationId;

  let status = 500;
  let detail = 'Erro interno.';
  let codigoRegra: string | undefined;

  if (
    err instanceof RegraNegocioError ||
    err instanceof RecursoNaoEncontradoError ||
    err instanceof ConflitoError
  ) {
    status = err.status;
    detail = err.message;
    codigoRegra = err.codigoRegra;
  }

  const corpo: CorpoProblema = {
    type: `${PREFIXO_URN}:${categoria(status)}`,
    title: categoria(status),
    status,
    detail,
    traceId,
  };

  if (codigoRegra) {
    corpo.codigoRegra = codigoRegra;
  }

  res.status(status).type('application/problem+json').json(corpo);
}
