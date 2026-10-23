'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ClienteResumo = {
  id: string;
  tipo: 'PF' | 'PJ';
  documento: string;
  nomeCompleto?: string;
  razaoSocial?: string;
  telefone: string;
};

export default function ListaClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteResumo[] | null>(null);
  const [erro, setErro] = useState(false);
  const [paraExcluir, setParaExcluir] = useState<ClienteResumo | null>(null);
  const [mensagemExclusao, setMensagemExclusao] = useState<string | null>(null);

  async function carregarClientes() {
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
  }

  useEffect(() => {
    void carregarClientes();
  }, []);

  async function confirmarExclusao() {
    const cliente = paraExcluir;
    if (!cliente) return;
    setParaExcluir(null);

    // O DELETE é `204` tanto para "excluído agora" quanto para "já estava excluído" (RN-009,
    // idempotente) — o único jeito de distinguir os dois casos para avisar o usuário é conferir
    // o estado antes de excluir.
    const respostaAntes = await fetch(`/api/clientes/${cliente.id}`, { cache: 'no-store' });
    const jaEstavaExcluido = respostaAntes.status === 410;

    await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' });

    setMensagemExclusao(
      jaEstavaExcluido
        ? 'Este cliente já havia sido excluído por outra sessão. A lista foi atualizada.'
        : null,
    );

    await carregarClientes();
  }

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

      {mensagemExclusao && <p role="status">{mensagemExclusao}</p>}

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
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.tipo}</TableCell>
                <TableCell>{cliente.documento}</TableCell>
                <TableCell>{cliente.nomeCompleto ?? cliente.razaoSocial}</TableCell>
                <TableCell>{cliente.telefone}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/clientes/${cliente.id}/editar`)}
                  >
                    Editar
                  </Button>
                  <Button variant="destructive" onClick={() => setParaExcluir(cliente)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={paraExcluir !== null} onOpenChange={(aberto) => !aberto && setParaExcluir(null)}>
        <AlertDialogContent role="dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir cliente {paraExcluir?.nomeCompleto ?? paraExcluir?.razaoSocial}?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
