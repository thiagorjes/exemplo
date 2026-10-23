import { test, expect } from '@playwright/test';
import { entrarPelaTela } from '../fixtures/auth';

/**
 * RF-001 — Login (docs/prd/cadastro-clientes-prd.md).
 * SCN-001.1, SCN-001.2, SCN-001.3.
 */
test.describe('Login', () => {
  test('SCN-001.1 — login bem-sucedido inicia uma sessão autenticada', async ({ page }) => {
    await entrarPelaTela(page, process.env.SEED_ADMIN_CPF!, process.env.SEED_ADMIN_SENHA!);

    // Sessão autenticada: a pessoa sai da tela de login e passa a ver uma área protegida.
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('SCN-001.2 — credencial inválida não revela se o CPF existe', async ({ page }) => {
    await entrarPelaTela(page, process.env.SEED_ADMIN_CPF!, 'senha-errada-123');
    await expect(page).toHaveURL(/\/login/);
    const mensagemCpfErrado = await page.getByRole('alert').textContent();

    await page.reload();
    await entrarPelaTela(page, '99999999999', 'qualquer-senha');
    await expect(page).toHaveURL(/\/login/);
    const mensagemCpfInexistente = await page.getByRole('alert').textContent();

    // Mesma mensagem genérica nos dois casos — não dá para distinguir CPF errado de inexistente.
    expect(mensagemCpfErrado).toBeTruthy();
    expect(mensagemCpfErrado).toBe(mensagemCpfInexistente);
  });

  test('SCN-001.3 — sessão expira após período de inatividade', async ({ page }) => {
    // A expiração (RN-004) é calculada no servidor a partir do relógio real
    // (`ultima_atividade_em`), não há mecanismo de adiantar o tempo do lado do teste — a suíte
    // espera o tempo real. SESSION_IDLE_TIMEOUT_MS tem que bater com o valor usado para subir o
    // backend (ver e2e/.env.example) — 30s no ambiente de e2e, não os 5min de produção (decisão
    // do demandante em 2026-10-22, para a suíte headed não ficar arrastada).
    const idleTimeoutMs = Number(process.env.SESSION_IDLE_TIMEOUT_MS ?? 30_000);
    test.setTimeout(idleTimeoutMs + 60_000);

    await entrarPelaTela(page, process.env.SEED_ADMIN_CPF!, process.env.SEED_ADMIN_SENHA!);
    await expect(page).not.toHaveURL(/\/login/);

    await page.waitForTimeout(idleTimeoutMs + 10_000);

    await page.reload();
    await expect(page).toHaveURL(/\/login/);
  });
});
