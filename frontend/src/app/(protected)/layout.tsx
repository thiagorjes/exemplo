import { redirect } from 'next/navigation';
import { validarSessaoAtual } from '@/lib/validar-sessao';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await validarSessaoAtual();

  if (!sessao) {
    redirect('/login');
  }

  return <>{children}</>;
}
