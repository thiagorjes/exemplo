import { NextResponse } from 'next/server';

const NOME_COOKIE = '__Host-sessao';

export async function POST(request: Request): Promise<NextResponse> {
  const corpo = await request.json();

  const respostaCore = await fetch(`${process.env.API_GATEWAY_URL}/v1/sessoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  });

  if (!respostaCore.ok) {
    // Nunca repassa o corpo do core (poderia detalhar demais) — resposta genérica.
    return NextResponse.json(
      { type: 'urn:cadastro-clientes:erro:nao-autenticado', status: 401 },
      { status: 401 },
    );
  }

  const sessao = (await respostaCore.json()) as {
    id: string;
    papel: 'admin_global' | 'usuario';
  };

  const resposta = NextResponse.json({ papel: sessao.papel }, { status: 201 });
  resposta.cookies.set(NOME_COOKIE, sessao.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
  return resposta;
}
