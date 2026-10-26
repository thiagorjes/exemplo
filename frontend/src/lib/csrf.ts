import { cookies } from 'next/headers';
import { NOME_COOKIE_CSRF, CABECALHO_CSRF } from './csrf-constantes';

export { NOME_COOKIE_CSRF, CABECALHO_CSRF };

// Double-submit CSRF (frontend/_shared/spa-bff.md §3): toda mutação via app/api/* exige o
// header acima igual ao cookie.
export async function verificarCsrf(request: Request): Promise<boolean> {
  const loja = await cookies();
  const valorCookie = loja.get(NOME_COOKIE_CSRF)?.value;
  const valorHeader = request.headers.get(CABECALHO_CSRF);
  return Boolean(valorCookie) && valorCookie === valorHeader;
}
