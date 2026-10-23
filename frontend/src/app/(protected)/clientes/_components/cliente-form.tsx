'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrashIcon } from '@phosphor-icons/react';
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

const socioSchema = z.object({
  nomeCompleto: z.string().min(1, 'Informe o nome completo do sócio.'),
  cpf: z.string().length(11, 'Informe um CPF válido (11 dígitos).'),
});

const schemaPJ = z.object({
  nomeFantasia: z.string().min(1, 'Informe o nome fantasia.'),
  razaoSocial: z.string().min(1, 'Informe a razão social.'),
  documento: z.string().length(14, 'Informe um CNPJ válido (14 dígitos).'),
  dataAbertura: z.string().min(1, 'Informe a data de abertura.'),
  endereco: z.string().min(1, 'Informe o endereço.'),
  telefone: z.string().min(1, 'Informe o telefone.'),
  // DDR-001: sem limite de sócios.
  socios: z
    .array(socioSchema)
    .min(1, 'Adicione ao menos um sócio — é dado mínimo obrigatório para Pessoa Jurídica.'),
});

type DadosFormularioPF = z.infer<typeof schemaPF>;
type DadosFormularioPJ = z.infer<typeof schemaPJ>;
export type DadosCliente =
  | ({ tipo: 'PF' } & DadosFormularioPF)
  | ({ tipo: 'PJ' } & DadosFormularioPJ);

type Props = {
  /** Presente só no modo editar — também trava a escolha de tipo (PUT não permite trocar). */
  valoresIniciais?: DadosCliente;
  /** Chama `POST /api/clientes` ou `PUT /api/clientes/[id]`, conforme o modo. */
  salvar: (dados: DadosCliente) => Promise<Response>;
};

function FormularioPF({
  valoresIniciais,
  salvar,
}: {
  valoresIniciais?: DadosFormularioPF;
  salvar: (dados: DadosCliente) => Promise<Response>;
}) {
  const router = useRouter();
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosFormularioPF>({ resolver: zodResolver(schemaPF), defaultValues: valoresIniciais });

  async function aoSubmeter(dados: DadosFormularioPF) {
    setMensagemErro(null);
    const resposta = await salvar({ tipo: 'PF', ...dados });

    if (resposta.status === 409) {
      const corpo = await resposta.json();
      setMensagemErro(`CPF ${corpo?.dadosApoio?.documento ?? dados.documento} já está cadastrado para outro cliente.`);
      return;
    }

    if (!resposta.ok) {
      setMensagemErro('Não foi possível salvar o cliente.');
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

      {mensagemErro && (
        <p role="alert" className="text-sm text-destructive-foreground">
          {mensagemErro}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Salvar cliente
      </Button>
    </form>
  );
}

function FormularioPJ({
  valoresIniciais,
  salvar,
}: {
  valoresIniciais?: DadosFormularioPJ;
  salvar: (dados: DadosCliente) => Promise<Response>;
}) {
  const router = useRouter();
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosFormularioPJ>({
    resolver: zodResolver(schemaPJ),
    defaultValues: valoresIniciais ?? { socios: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'socios' });

  async function aoSubmeter(dados: DadosFormularioPJ) {
    setMensagemErro(null);
    const resposta = await salvar({ tipo: 'PJ', ...dados });

    if (resposta.status === 409) {
      const corpo = await resposta.json();
      setMensagemErro(`CNPJ ${corpo?.dadosApoio?.documento ?? dados.documento} já está cadastrado para outro cliente.`);
      return;
    }

    if (!resposta.ok) {
      setMensagemErro('Não foi possível salvar o cliente.');
      return;
    }

    router.push('/clientes');
  }

  return (
    <form onSubmit={handleSubmit(aoSubmeter)} className="flex flex-col gap-4" aria-label="Dados da pessoa jurídica">
      <Input
        id="nomeFantasia"
        label="Nome fantasia"
        error={Boolean(errors.nomeFantasia)}
        errorMessage={errors.nomeFantasia?.message}
        disabled={isSubmitting}
        {...register('nomeFantasia')}
      />
      <Input
        id="razaoSocial"
        label="Razão social"
        error={Boolean(errors.razaoSocial)}
        errorMessage={errors.razaoSocial?.message}
        disabled={isSubmitting}
        {...register('razaoSocial')}
      />
      <Input
        id="documento"
        label="CNPJ"
        error={Boolean(errors.documento)}
        errorMessage={errors.documento?.message}
        disabled={isSubmitting}
        {...register('documento')}
      />
      <Input
        id="dataAbertura"
        label="Data de abertura"
        type="date"
        error={Boolean(errors.dataAbertura)}
        errorMessage={errors.dataAbertura?.message}
        disabled={isSubmitting}
        {...register('dataAbertura')}
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

      <div className="flex flex-col gap-4" role="group" aria-label="Sócios">
        <h2 className="text-lg font-semibold text-foreground">Sócios</h2>

        {fields.map((campo, indice) => (
          <div key={campo.id} className="flex items-end gap-2">
            <Input
              id={`socios.${indice}.nomeCompleto`}
              label="Nome completo do sócio"
              error={Boolean(errors.socios?.[indice]?.nomeCompleto)}
              errorMessage={errors.socios?.[indice]?.nomeCompleto?.message}
              disabled={isSubmitting}
              {...register(`socios.${indice}.nomeCompleto` as const)}
            />
            <Input
              id={`socios.${indice}.cpf`}
              label="CPF do sócio"
              error={Boolean(errors.socios?.[indice]?.cpf)}
              errorMessage={errors.socios?.[indice]?.cpf?.message}
              disabled={isSubmitting}
              {...register(`socios.${indice}.cpf` as const)}
            />
            <Button
              type="button"
              variant="ghost"
              aria-label="Remover sócio"
              disabled={isSubmitting}
              onClick={() => remove(indice)}
            >
              <TrashIcon size={18} />
            </Button>
          </div>
        ))}

        {errors.socios?.message && (
          <p role="alert" className="text-sm text-destructive-foreground">
            {errors.socios.message}
          </p>
        )}

        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => append({ nomeCompleto: '', cpf: '' })}
        >
          + Adicionar sócio
        </Button>
      </div>

      {mensagemErro && (
        <p role="alert" className="text-sm text-destructive-foreground">
          {mensagemErro}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Salvar cliente
      </Button>
    </form>
  );
}

export function ClienteForm({ valoresIniciais, salvar }: Props) {
  const [tipo, setTipo] = useState<'PF' | 'PJ' | null>(valoresIniciais?.tipo ?? null);
  const tipoTravado = Boolean(valoresIniciais);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4" role="group" aria-label="Tipo de cliente">
        <Button
          type="button"
          variant={tipo === 'PF' ? 'primary' : 'secondary'}
          disabled={tipoTravado}
          onClick={() => setTipo('PF')}
        >
          Pessoa Física
        </Button>
        <Button
          type="button"
          variant={tipo === 'PJ' ? 'primary' : 'secondary'}
          disabled={tipoTravado}
          onClick={() => setTipo('PJ')}
        >
          Pessoa Jurídica
        </Button>
      </div>

      {tipo === 'PF' && (
        <FormularioPF
          valoresIniciais={valoresIniciais?.tipo === 'PF' ? valoresIniciais : undefined}
          salvar={salvar}
        />
      )}
      {tipo === 'PJ' && (
        <FormularioPJ
          valoresIniciais={valoresIniciais?.tipo === 'PJ' ? valoresIniciais : undefined}
          salvar={salvar}
        />
      )}
    </div>
  );
}
