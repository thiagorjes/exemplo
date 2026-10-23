// Jest não lê `.env` (só `node --env-file=.env` faz isso) — sem isso `config/index.ts`
// (`process.exit(1)` em config inválida) derruba qualquer teste que importe `app.ts`,
// mesmo quando o teste injeta repository e nunca toca o banco de verdade.
process.env.PORT ??= '3001';
process.env.DATABASE_PATH ??= './data/test.db';
process.env.SESSION_SECRET ??= 'segredo-de-teste';
