import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_PATH: z.string().min(1),
  // Janela de inatividade antes da sessão expirar (RN-004). Opcional — padrão de produção é
  // 300000ms/5min; o ambiente de e2e roda com 30000ms/30s (ver e2e/.env.example) para a suíte
  // headed não ficar arrastada. Não hardcoded no service, por isso vive na config.
  SESSION_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(300_000),
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
