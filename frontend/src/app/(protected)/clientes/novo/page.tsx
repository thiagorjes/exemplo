'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormularioClientePF } from './_components/formulario-cliente-pf';

type TipoCliente = 'PF' | 'PJ';

export default function IncluirClientePage() {
  const [tipo, setTipo] = useState<TipoCliente | null>(null);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Incluir cliente</h1>

      <div className="flex gap-4" role="group" aria-label="Tipo de cliente">
        <Button
          type="button"
          variant={tipo === 'PF' ? 'primary' : 'secondary'}
          onClick={() => setTipo('PF')}
        >
          Pessoa Física
        </Button>
        <Button
          type="button"
          variant={tipo === 'PJ' ? 'primary' : 'secondary'}
          onClick={() => setTipo('PJ')}
        >
          Pessoa Jurídica
        </Button>
      </div>

      {tipo === 'PF' && <FormularioClientePF />}
    </main>
  );
}
