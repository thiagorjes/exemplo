'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mesmo formato do `backend/src/cliente/schema.ts` (pacote separado, sem módulo
// compartilhado nesta demo) — mensagens próprias para exibição ao usuário.
const schemaPF = z.object({
  nomeCompleto: z.string().min(1, 'Informe o nome completo.'),
  documento: z.string().length(11, 'Informe um CPF válido (11 dígitos).'),
  dataNascimento: z.string().min(1, 'Informe a data de nascimento.'),
  endereco: z.string().min(1, 'Informe o endereço.'),
  telefone: z.string().min(1, 'Informe o telefone.'),
});

type DadosFormularioPF = z.infer<typeof schemaPF>;

export function FormularioClientePF() {
  const router = useRouter();
  const [mensagemConflito, setMensagemConflito] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosFormularioPF>({ resolver: zodResolver(schemaPF) });

  async function aoSubmeter(dados: DadosFormularioPF) {
    setMensagemConflito(null);

    const resposta = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: 'PF', ...dados }),
    });

    if (resposta.status === 409) {
      const corpo = await resposta.json();
      setMensagemConflito(`CPF ${corpo?.dadosApoio?.documento ?? dados.documento} já está cadastrado para outro cliente.`);
      return;
    }

    if (!resposta.ok) {
      setMensagemConflito('Não foi possível cadastrar o cliente.');
      return;
    }

    router.push('/clientes');
  }

  return (
    <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col gap-4" aria-label="Dados da pessoa física">
      <Input
        id="nomeCompleto"
        label="Nome completo"
        error={Boolean(errors.nomeCompleto)}
        errorMessage={errors.nomeCompleto?.message}
        disabled={isSubmitting}
        {...register('nomeCompleto')}
      />
      <Input
        id="documento"
        label="CPF"
        error={Boolean(errors.documento)}
        errorMessage={errors.documento?.message}
        disabled={isSubmitting}
        {...register('documento')}
      />
      <Input
        id="dataNascimento"
        label="Data de nascimento"
        type="date"
        error={Boolean(errors.dataNascimento)}
        errorMessage={errors.dataNascimento?.message}
        disabled={isSubmitting}
        {...register('dataNascimento')}
      />
      <Input
        id="endereco"
        label="Endereço"
        error={Boolean(errors.endereco)}
        errorMessage={errors.endereco?.message}
        disabled={isSubmitting}
        {...register('endereco')}
      />
      <Input
        id="telefone"
        label="Telefone"
        error={Boolean(errors.telefone)}
        errorMessage={errors.telefone?.message}
        disabled={isSubmitting}
        {...register('telefone')}
      />

      {mensagemConflito && (
        <p role="alert" className="text-sm text-destructive-foreground">
          {mensagemConflito}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Salvar cliente
      </Button>
    </form>
  );
}
