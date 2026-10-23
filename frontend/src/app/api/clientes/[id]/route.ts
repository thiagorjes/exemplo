import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NOME_COOKIE_SESSAO } from '@/lib/sessao-cookie';

async function sessaoId(): Promise<string | undefined> {
  const loja = await cookies();
  return loja.get(NOME_COOKIE_SESSAO)?.value;
}

function naoAutenticado(): NextResponse {
  return NextResponse.json(
    { type: 'urn:cadastro-clientes:erro:nao-autenticado', status: 401 },
    { status: 401 },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const id = await sessaoId();
  if (!id) {
    return naoAutenticado();
  }

  const { id: clienteId } = await params;
  const respostaCore = await fetch(`${process.env.API_GATEWAY_URL}/v1/clientes/${clienteId}`, {
    headers: { 'X-Sessao-Id': id },
    cache: 'no-store',
  });

  const corpoResposta = await respostaCore.json();
  return NextResponse.json(corpoResposta, { status: respostaCore.status });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const id = await sessaoId();
  if (!id) {
    return naoAutenticado();
  }

  const { id: clienteId } = await params;
  const corpo = await request.json();
  const respostaCore = await fetch(`${process.env.API_GATEWAY_URL}/v1/clientes/${clienteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Sessao-Id': id },
    body: JSON.stringify(corpo),
  });

  const corpoResposta = await respostaCore.json();
  return NextResponse.json(corpoResposta, { status: respostaCore.status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const id = await sessaoId();
  if (!id) {
    return naoAutenticado();
  }

  const { id: clienteId } = await params;
  const respostaCore = await fetch(`${process.env.API_GATEWAY_URL}/v1/clientes/${clienteId}`, {
    method: 'DELETE',
    headers: { 'X-Sessao-Id': id },
  });

  // `204 No Content` não tem corpo — `DELETE` nunca falha com corpo de erro que precise ser
  // repassado além do status (o único caso de erro é `404`, também sem corpo relevante aqui).
  if (respostaCore.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const corpoResposta = await respostaCore.json();
  return NextResponse.json(corpoResposta, { status: respostaCore.status });
}
