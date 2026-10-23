import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Modo headed por padrão — ADR-002 (docs/decisions/ADR-002-playwright-e2e-visual.md).
 * É o objetivo declarado desta demonstração: a suíte roda visível, não só headless.
 * `npm run test:e2e:headless` (script do package.json) define PW_HEADLESS=true para a
 * variante de CI; sem essa variável, `headless` é `false`.
 */
export default defineConfig({
  testDir: './tests',
  // Todos os specs batem no mesmo arquivo SQLite (backend/data/*.db) — rodar em série evita
  // corrida de dados entre arquivos de teste distintos (decisão desta suíte, não do contrato).
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    headless: process.env.PW_HEADLESS === 'true',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
