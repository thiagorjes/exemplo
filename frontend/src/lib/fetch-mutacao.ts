import { CABECALHO_CSRF, NOME_COOKIE_CSRF } from './csrf-constantes';

function lerCookie(nome: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Usar no lugar de `fetch` direto para qualquer chamada mutável (POST/PUT/DELETE) a `/api/*` —
// ecoa o cookie de CSRF (lido pelo JS, por isso não é o cookie de sessão) no header que o BFF
// confere (frontend/_shared/spa-bff.md §3).
export function fetchMutacao(url: string, init: RequestInit = {}): Promise<Response> {
  const token = lerCookie(NOME_COOKIE_CSRF);
  return fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      ...(token ? { [CABECALHO_CSRF]: token } : {}),
    },
  });
}
