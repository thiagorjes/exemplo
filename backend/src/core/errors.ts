export class RegraNegocioError extends Error {
  readonly status: number;
  readonly codigoRegra?: string;

  constructor(message: string, status: number, codigoRegra?: string) {
    super(message);
    this.name = 'RegraNegocioError';
    this.status = status;
    this.codigoRegra = codigoRegra;
  }
}

export class RecursoNaoEncontradoError extends Error {
  readonly status = 404;
  readonly codigoRegra?: string;

  constructor(message: string, codigoRegra?: string) {
    super(message);
    this.name = 'RecursoNaoEncontradoError';
    this.codigoRegra = codigoRegra;
  }
}

export class ConflitoError extends Error {
  readonly status = 409;
  readonly codigoRegra?: string;

  constructor(message: string, codigoRegra?: string) {
    super(message);
    this.name = 'ConflitoError';
    this.codigoRegra = codigoRegra;
  }
}
