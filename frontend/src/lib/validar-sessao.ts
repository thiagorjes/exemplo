import { cookies } from 'next/headers';
import { NOME_COOKIE_SESSAO as NOME_COOKIE } from '@/lib/sessao-cookie';

export async function validarSessaoAtual(): Promise<{
  usuarioId: string;
  papel: 'admin_global' | 'usuario';
} | null> {
  const loja = await cookies();
  const id = loja.get(NOME_COOKIE)?.value;

  if (!id) {
    return null;
  }

  const respostaCore = await fetch(`${process.env.API_GATEWAY_URL}/v1/sessoes/${id}`, {
    cache: 'no-store',
  });

  if (!respostaCore.ok) {
    // `cookies().delete()` só é permitido em Server Action/Route Handler, não em Server
    // Component (onde o layout protegido roda) — a revalidação sempre no servidor a cada
    // acesso já garante que a presença do cookie, sozinha, nunca concede acesso.
    try {
      loja.delete(NOME_COOKIE);
    } catch {
      // Esperado em Server Component — a limpeza efetiva acontece no próximo POST /api/sessoes.
    }
    return null;
  }

  const sessao = (await respostaCore.json()) as {
    usuarioId: string;
    papel: 'admin_global' | 'usuario';
  };
  return { usuarioId: sessao.usuarioId, papel: sessao.papel };
}
