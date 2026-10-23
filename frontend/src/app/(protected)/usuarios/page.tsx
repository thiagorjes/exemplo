import { redirect } from 'next/navigation';
import { validarSessaoAtual } from '@/lib/validar-sessao';
import { GestaoUsuariosForm } from './_components/gestao-usuarios-form';

// `(protected)/layout.tsx` só confirma que existe sessão válida, não o papel — a conferência
// de papel é só UX (a segurança real está no 403 do core, ver TASK-02.1); redireciona quem
// não é admin global para a tela que de fato lhe pertence.
export default async function GestaoUsuariosPage() {
  const sessao = await validarSessaoAtual();

  if (sessao?.papel !== 'admin_global') {
    redirect('/clientes');
  }

  return <GestaoUsuariosForm />;
}
