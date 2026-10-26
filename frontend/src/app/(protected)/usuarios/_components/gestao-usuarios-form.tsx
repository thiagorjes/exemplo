'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchMutacao } from '@/lib/fetch-mutacao';

type Usuario = {
  id: string;
  cpf: string;
  papel: 'admin_global' | 'usuario';
  criadoEm: string;
};

export function GestaoUsuariosForm() {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregarUsuarios() {
    const resposta = await fetch('/api/usuarios');
    if (resposta.ok) {
      setUsuarios(await resposta.json());
    }
  }

  useEffect(() => {
    void carregarUsuarios();
  }, []);

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensagem(null);
    setCarregando(true);

    try {
      const resposta = await fetchMutacao('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha }),
      });

      if (!resposta.ok) {
        const corpo = await resposta.json();
        const cpfConflito = corpo?.dadosApoio?.cpf ?? cpf;
        setMensagem(
          resposta.status === 409
            ? `CPF ${cpfConflito} já está cadastrado para outro usuário.`
            : 'Não foi possível criar o usuário.',
        );
        return;
      }

      setCpf('');
      setSenha('');
      await carregarUsuarios();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold text-foreground">Gestão de usuários</h1>

      <form onSubmit={aoSubmeter} className="flex flex-wrap items-end gap-4" aria-label="Criar usuário">
        <Input
          id="cpf"
          name="cpf"
          label="CPF"
          value={cpf}
          onChangeValue={setCpf}
          disabled={carregando}
          required
        />
        <Input
          id="senha"
          name="senha"
          type="password"
          label="Senha"
          value={senha}
          onChangeValue={setSenha}
          disabled={carregando}
          required
          minLength={8}
        />
        <Button type="submit" isLoading={carregando}>
          Criar usuário
        </Button>
      </form>

      {mensagem && (
        <p role="alert" className="text-sm text-destructive-foreground">
          {mensagem}
        </p>
      )}

      {usuarios &&
        (() => {
          const outrosUsuarios = usuarios.filter((usuario) => usuario.papel !== 'admin_global');

          if (outrosUsuarios.length === 0) {
            return <p>Nenhum usuário cadastrado além do admin global.</p>;
          }

          return (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CPF</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outrosUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.cpf}</TableCell>
                    <TableCell>{usuario.papel}</TableCell>
                    <TableCell>{new Date(usuario.criadoEm).toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          );
        })()}
    </main>
  );
}
