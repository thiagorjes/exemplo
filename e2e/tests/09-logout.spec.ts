import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-009 — Logout (docs/prd/cadastro-clientes-prd.md, emenda pós-gate). SCN-009.1, SCN-009.2.
 * SCN-009.3 (logout duas vezes em sequência) é integração — ver
 * backend/test/sessao/routes.test.ts. Texto do botão "Sair" conforme
 * docs/tasks/cadastro-clientes/TASK-05.3-navbar-logout.md.
 */
async function novoUsuarioAutenticado() {
  const sessaoAdminId = await criarSessaoAdmin();
  const cpf = documentoUnico(11);
  await criarUsuario(sessaoAdminId, cpf, 'senha12345');
  return criarSessaoUsuario(cpf, 'senha12345');
}

test.describe('Logout', () => {
  test('SCN-009.1 — logout encerra a sessão', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    await injetarSessao(context, sessaoUsuarioId);

    await page.goto('/clientes');
    await page.getByRole('button', { name: 'Sair' }).click();

    await expect(page).toHaveURL(/\/login/);

    // Sessão encerrada: qualquer operação seguinte exige novo login.
    await page.goto('/clientes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('SCN-009.2 — logout com sessão já expirada por inatividade', async ({ page, context }) => {
    // SESSION_IDLE_TIMEOUT_MS tem que bater com o valor usado para subir o backend (ver
    // e2e/.env.example) — 30s no ambiente de e2e, não os 5min de produção.
    const idleTimeoutMs = Number(process.env.SESSION_IDLE_TIMEOUT_MS ?? 30_000);
    test.setTimeout(idleTimeoutMs + 60_000);
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    await injetarSessao(context, sessaoUsuarioId);

    await page.goto('/clientes');
    await page.waitForTimeout(idleTimeoutMs + 10_000);

    // Mesmo com a sessão já expirada no servidor, acionar "Sair" não deve produzir erro visível.
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
