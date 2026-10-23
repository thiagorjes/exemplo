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
  readonly status: number;
  readonly codigoRegra?: string;

  // `status` aceita 404 (nunca existiu) ou 410 (existiu e foi excluído) — mesma categoria de
  // erro (urn:...:erro:nao-encontrado), status diferente conforme a distinção que a Regra de
  // borda #4 de /solution exige (ver docs/techspec/cadastro-clientes/contracts/cliente.md).
  constructor(message: string, status = 404, codigoRegra?: string) {
    super(message);
    this.name = 'RecursoNaoEncontradoError';
    this.status = status;
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
