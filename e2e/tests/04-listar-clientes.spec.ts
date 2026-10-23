import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, criarCliente, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-008 — Usuário busca/lista clientes cadastrados (docs/prd/cadastro-clientes-prd.md).
 * SCN-008.1, SCN-008.2, SCN-008.3.
 *
 * Ordem deliberada: SCN-008.2 ("nenhum cliente cadastrado ainda") precisa rodar antes de
 * qualquer outro spec criar um cliente — por isso este arquivo tem o prefixo `04-`, antes de
 * `05-incluir-cliente-pf` em diante.
 */
async function novoUsuarioAutenticado() {
  const sessaoAdminId = await criarSessaoAdmin();
  const cpf = documentoUnico(11);
  await criarUsuario(sessaoAdminId, cpf, 'senha12345');
  return criarSessaoUsuario(cpf, 'senha12345');
}

test.describe('Listar clientes', () => {
  test('SCN-008.2 — nenhum cliente cadastrado ainda', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    await injetarSessao(context, sessaoUsuarioId);

    await page.goto('/clientes');

    await expect(page.getByText('Nenhum cliente cadastrado ainda.')).toBeVisible();
  });

  test('SCN-008.1 — lista de clientes exibida', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(11);
    await criarCliente(sessaoUsuarioId, {
      tipo: 'PF',
      documento,
      nomeCompleto: 'Maria Silva Souza',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes');

    await expect(page.getByRole('row', { name: new RegExp(documento) })).toBeVisible();
  });

  test('SCN-008.3 — acesso sem sessão autenticada', async ({ page }) => {
    await page.goto('/clientes');

    await expect(page).toHaveURL(/\/login/);
  });
});
