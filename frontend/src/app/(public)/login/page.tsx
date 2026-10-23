'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MENSAGEM_ERRO = 'CPF ou senha inválidos';

export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  async function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(false);
    setCarregando(true);

    try {
      const resposta = await fetch('/api/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha }),
      });

      if (!resposta.ok) {
        setErro(true);
        return;
      }

      const { papel } = (await resposta.json()) as { papel: 'admin_global' | 'usuario' };
      router.push(papel === 'admin_global' ? '/usuarios' : '/clientes');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={aoSubmeter}
        className="flex w-full max-w-sm flex-col gap-4 p-6"
        aria-label="Login"
      >
        <Input
          id="cpf"
          name="cpf"
          label="CPF"
          autoComplete="username"
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
          autoComplete="current-password"
          value={senha}
          onChangeValue={setSenha}
          disabled={carregando}
          required
        />

        {erro && (
          <p role="alert" className="text-sm text-destructive-foreground">
            {MENSAGEM_ERRO}
          </p>
        )}

        <Button type="submit" isLoading={carregando}>
          Entrar
        </Button>
      </form>
    </main>
  );
}
