import { NextResponse, type NextRequest } from 'next/server';
import { NOME_COOKIE_CSRF } from '@/lib/csrf-constantes';

// Garante que o cookie de CSRF (double-submit, spa-bff.md §3) exista antes de qualquer
// mutação — precisa estar presente mesmo para quem ainda não fez login (a própria rota de
// login é uma mutação).
export function middleware(request: NextRequest): NextResponse {
  const resposta = NextResponse.next();

  if (!request.cookies.get(NOME_COOKIE_CSRF)) {
    resposta.cookies.set(NOME_COOKIE_CSRF, crypto.randomUUID(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  return resposta;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
