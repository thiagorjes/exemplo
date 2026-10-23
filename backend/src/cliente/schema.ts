import { z } from 'zod';

const socioSchema = z.object({ nomeCompleto: z.string().min(1), cpf: z.string().length(11) });

const pfSchema = z.object({
  tipo: z.literal('PF'),
  documento: z.string().length(11),
  nomeCompleto: z.string().min(1),
  dataNascimento: z.string().min(1),
  endereco: z.string().min(1),
  telefone: z.string().min(1),
});

const pjSchema = z.object({
  tipo: z.literal('PJ'),
  documento: z.string().length(14),
  nomeFantasia: z.string().min(1),
  razaoSocial: z.string().min(1),
  dataAbertura: z.string().min(1),
  endereco: z.string().min(1),
  telefone: z.string().min(1),
  socios: z.array(socioSchema).min(1),
});

export const clienteSchema = z.discriminatedUnion('tipo', [pfSchema, pjSchema]);
