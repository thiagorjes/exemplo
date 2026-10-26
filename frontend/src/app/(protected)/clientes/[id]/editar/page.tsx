'use client';

import { use, useEffect, useState } from 'react';
import { ClienteForm, type DadosCliente } from '../../_components/cliente-form';
import { fetchMutacao } from '@/lib/fetch-mutacao';

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'excluido' }
  | { tipo: 'nao-encontrado' }
  | { tipo: 'pronto'; cliente: DadosCliente };

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });

  useEffect(() => {
    let cancelado = false;

    fetch(`/api/clientes/${id}`, { cache: 'no-store' }).then(async (resposta) => {
      if (cancelado) return;

      if (resposta.status === 410) {
        setEstado({ tipo: 'excluido' });
        return;
      }
      if (!resposta.ok) {
        setEstado({ tipo: 'nao-encontrado' });
        return;
      }

      const cliente = (await resposta.json()) as DadosCliente;
      setEstado({ tipo: 'pronto', cliente });
    });

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function salvar(dados: DadosCliente): Promise<Response> {
    return fetchMutacao(`/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
  }

  if (estado.tipo === 'carregando') {
    return null;
  }

  if (estado.tipo === 'excluido') {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
        <p>Este cliente foi excluído e não pode mais ser editado.</p>
        <a href="/clientes" className="text-primary underline">
          Voltar para a lista de clientes
        </a>
      </main>
    );
  }

  if (estado.tipo === 'nao-encontrado') {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
        <p>Cliente não encontrado.</p>
        <a href="/clientes" className="text-primary underline">
          Voltar para a lista de clientes
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Editar cliente</h1>
      <ClienteForm valoresIniciais={estado.cliente} salvar={salvar} />
    </main>
  );
}
