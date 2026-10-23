import { redirect } from 'next/navigation';
import { validarSessaoAtual } from '@/lib/validar-sessao';
import { Navbar } from './_components/navbar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await validarSessaoAtual();

  if (!sessao) {
    redirect('/login');
  }

  return (
    <>
      <Navbar papel={sessao.papel} />
      {children}
    </>
  );
}
