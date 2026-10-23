import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, criarCliente, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-006 — Usuário edita cadastro de cliente (docs/prd/cadastro-clientes-prd.md).
 * SCN-006.1, SCN-006.2. SCN-006.3 (edição concorrente) é integração — ver
 * backend/test/cliente/routes.test.ts, conforme o plano de verificação.
 */
async function novoUsuarioAutenticado() {
  const sessaoAdminId = await criarSessaoAdmin();
  const cpf = documentoUnico(11);
  await criarUsuario(sessaoAdminId, cpf, 'senha12345');
  return criarSessaoUsuario(cpf, 'senha12345');
}

test.describe('Editar cliente', () => {
  test('SCN-006.1 — edição de cliente bem-sucedida', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(11);
    await criarCliente(sessaoUsuarioId, {
      tipo: 'PF',
      documento,
      nomeCompleto: 'Nome Original',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes');
    await page.getByRole('row', { name: new RegExp(documento) }).getByRole('button', { name: 'Editar' }).click();

    await page.getByLabel('Nome completo').fill('Nome Atualizado');
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    await expect(page).toHaveURL(/\/clientes(?!.*\/editar)/);
    await expect(page.getByText('Nome Atualizado')).toBeVisible();
  });

  test('SCN-006.2 — edição deixaria campo obrigatório vazio', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(11);
    await criarCliente(sessaoUsuarioId, {
      tipo: 'PF',
      documento,
      nomeCompleto: 'Nome Original',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes');
    await page.getByRole('row', { name: new RegExp(documento) }).getByRole('button', { name: 'Editar' }).click();

    await page.getByLabel('Nome completo').fill('');
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    await expect(page.getByText('Informe o nome completo.')).toBeVisible();
    // O dado anterior é mantido — a tela continua de edição, não perde o cliente.
    await expect(page).toHaveURL(/\/editar/);
  });
});
