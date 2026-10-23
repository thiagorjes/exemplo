import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, criarCliente, excluirCliente, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-007 — Usuário exclui cadastro de cliente (docs/prd/cadastro-clientes-prd.md).
 * SCN-007.1, SCN-007.2, SCN-007.3.
 */
async function novoUsuarioAutenticado() {
  const sessaoAdminId = await criarSessaoAdmin();
  const cpf = documentoUnico(11);
  await criarUsuario(sessaoAdminId, cpf, 'senha12345');
  return criarSessaoUsuario(cpf, 'senha12345');
}

test.describe('Excluir cliente', () => {
  test('SCN-007.1 — exclusão de cliente bem-sucedida', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(11);
    await criarCliente(sessaoUsuarioId, {
      tipo: 'PF',
      documento,
      nomeCompleto: 'Cliente A Excluir',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes');
    await page.getByRole('row', { name: new RegExp(documento) }).getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();

    await expect(page.getByRole('row', { name: new RegExp(documento) })).toHaveCount(0);
  });

  test('SCN-007.2 — cliente já excluído por outra sessão', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(11);
    const cliente = await criarCliente(sessaoUsuarioId, {
      tipo: 'PF',
      documento,
      nomeCompleto: 'Cliente Concorrente',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes');
    await expect(page.getByRole('row', { name: new RegExp(documento) })).toBeVisible();

    // "Outra sessão" exclui o cliente enquanto a tela já carregada não sabe disso ainda.
    await excluirCliente(sessaoUsuarioId, cliente.id);

    await page.getByRole('row', { name: new RegExp(documento) }).getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Excluir' }).click();

    await expect(page.getByText('Este cliente já havia sido excluído por outra sessão. A lista foi atualizada.')).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(documento) })).toHaveCount(0);
  });

  test('SCN-007.3 — exclusão é definitiva', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(11);
    const cliente = await criarCliente(sessaoUsuarioId, {
      tipo: 'PF',
      documento,
      nomeCompleto: 'Cliente Definitivo',
      dataNascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      telefone: '27999999999',
    });
    await excluirCliente(sessaoUsuarioId, cliente.id);

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes');

    // Sem nenhuma forma de reativação (RN-009) — o cliente não aparece mais, nem após recarregar.
    await expect(page.getByRole('row', { name: new RegExp(documento) })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('row', { name: new RegExp(documento) })).toHaveCount(0);
  });
});
