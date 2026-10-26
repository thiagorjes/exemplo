'use client';

import { ClienteForm, type DadosCliente } from '../_components/cliente-form';
import { fetchMutacao } from '@/lib/fetch-mutacao';

export default function IncluirClientePage() {
  async function salvar(dados: DadosCliente): Promise<Response> {
    return fetchMutacao('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Incluir cliente</h1>
      <ClienteForm salvar={salvar} />
    </main>
  );
}
