'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchMutacao } from '@/lib/fetch-mutacao';

const ROTULO_PAPEL: Record<'admin_global' | 'usuario', string> = {
  admin_global: 'Admin global',
  usuario: 'Usuário',
};

export function Navbar({ papel }: { papel: 'admin_global' | 'usuario' }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await fetchMutacao('/api/sessoes', { method: 'DELETE' });
    } finally {
      router.push('/login');
    }
  }

  return (
    <nav className="flex h-[5rem] items-center justify-between border-b px-6" style={{ zIndex: 50 }}>
      <span className="text-sm text-muted-foreground">{ROTULO_PAPEL[papel]}</span>
      <Button variant="secondary" onClick={sair} isLoading={saindo} loadingLabel="Sair">
        Sair
      </Button>
    </nav>
  );
}
