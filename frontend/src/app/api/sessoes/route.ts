import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NOME_COOKIE_SESSAO, OPCOES_COOKIE_SESSAO } from '@/lib/sessao-cookie';

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
  resposta.cookies.set(NOME_COOKIE_SESSAO, sessao.id, OPCOES_COOKIE_SESSAO);
  return resposta;
}

export async function DELETE(): Promise<NextResponse> {
  const loja = await cookies();
  const id = loja.get(NOME_COOKIE_SESSAO)?.value;

  if (id) {
    // Incondicional: o cookie é limpo mesmo que esta chamada falhe — o usuário não pode ficar
    // com um cookie que já tentou encerrar.
    await fetch(`${process.env.API_GATEWAY_URL}/v1/sessoes/${id}`, { method: 'DELETE' }).catch(
      () => undefined,
    );
  }

  const resposta = new NextResponse(null, { status: 204 });
  resposta.cookies.set(NOME_COOKIE_SESSAO, '', { ...OPCOES_COOKIE_SESSAO, maxAge: 0 });
  return resposta;
}
