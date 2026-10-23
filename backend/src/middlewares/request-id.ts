import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const HEADER = 'X-Correlation-Id';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const existente = req.header(HEADER);
  const id = existente && existente.length > 0 ? existente : randomUUID();

  req.correlationId = id;
  res.setHeader(HEADER, id);
  next();
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}
