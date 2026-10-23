import { Button } from '@/components/ui/button';

// Página de verificação do scaffolding (critério de aceite #2 da TASK-01.4) — renderiza o
// Button do design system para confirmar que os tokens de cor estão carregados. Substituída
// pela tela de login de verdade na TASK-01.6.
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button>Scaffolding ok</Button>
    </main>
  );
}
