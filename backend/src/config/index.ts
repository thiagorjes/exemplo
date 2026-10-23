import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_PATH: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
});

function carregar() {
  const resultado = schema.safeParse(process.env);

  if (!resultado.success) {
    const ausentes = resultado.error.issues.map((issue) => String(issue.path[0]));
    // eslint-disable-next-line no-console
    console.error(
      `Configuração inválida — variável(is) ausente(s) ou inválida(s): ${ausentes.join(', ')}`,
    );
    process.exit(1);
  }

  return resultado.data;
}

export const config = carregar();
