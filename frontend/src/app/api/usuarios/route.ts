import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NOME_COOKIE_SESSAO } from '@/lib/sessao-cookie';

async function sessaoId(): Promise<string | undefined> {
  const loja = await cookies();
  return loja.get(NOME_COOKIE_SESSAO)?.value;
}

export async function POST(request: Request): Promise<NextResponse> {
  const id = await sessaoId();
  if (!id) {
    return NextResponse.json(
      { type: 'urn:cadastro-clientes:erro:nao-autenticado', status: 401 },
      { status: 401 },
    );
  }

  const corpo = await request.json();
  const respostaCore = await fetch(`${process.env.API_GATEWAY_URL}/v1/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Sessao-Id': id },
    body: JSON.stringify(corpo),
  });

  const corpoResposta = await respostaCore.json();
  return NextResponse.json(corpoResposta, { status: respostaCore.status });
}

export async function GET(): Promise<NextResponse> {
  const id = await sessaoId();
  if (!id) {
    return NextResponse.json(
      { type: 'urn:cadastro-clientes:erro:nao-autenticado', status: 401 },
      { status: 401 },
    );
  }

  const respostaCore = await fetch(`${process.env.API_GATEWAY_URL}/v1/usuarios`, {
    headers: { 'X-Sessao-Id': id },
    cache: 'no-store',
  });

  const corpoResposta = await respostaCore.json();
  return NextResponse.json(corpoResposta, { status: respostaCore.status });
}
