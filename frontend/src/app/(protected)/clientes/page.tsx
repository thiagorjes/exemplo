'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ClienteResumo = {
  id: string;
  tipo: 'PF' | 'PJ';
  documento: string;
  nomeCompleto?: string;
  razaoSocial?: string;
  telefone: string;
};

export default function ListaClientesPage() {
  const [clientes, setClientes] = useState<ClienteResumo[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const resposta = await fetch('/api/clientes');
        if (!resposta.ok) {
          setErro(true);
          return;
        }
        setClientes(await resposta.json());
      } catch {
        setErro(true);
      }
    })();
  }, []);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
        <Button asChild>
          <Link href="/clientes/novo">Incluir cliente</Link>
        </Button>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive-foreground">
          Não foi possível carregar a lista de clientes.
        </p>
      )}

      {clientes === null && !erro && <p>Carregando…</p>}

      {clientes && clientes.length === 0 && <p>Nenhum cliente cadastrado ainda.</p>}

      {clientes && clientes.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.tipo}</TableCell>
                <TableCell>{cliente.documento}</TableCell>
                <TableCell>{cliente.nomeCompleto ?? cliente.razaoSocial}</TableCell>
                <TableCell>{cliente.telefone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
