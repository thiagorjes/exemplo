import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-003 — Admin global visualiza lista de usuários cadastrados, somente leitura
 * (docs/prd/cadastro-clientes-prd.md). SCN-003.1, SCN-003.2, SCN-003.3.
 *
 * Ordem deliberada: SCN-003.2 ("nenhum usuário além do admin") precisa rodar antes de
 * qualquer outro spec criar um usuário — por isso este arquivo tem o prefixo `02-`, logo
 * depois do login e antes de `03-criar-usuario`. Dentro do arquivo, a ordem de declaração
 * também importa pelo mesmo motivo.
 */
test.describe('Listar usuários', () => {
  test('SCN-003.2 — nenhum usuário além do próprio admin global criado ainda', async ({ page, context }) => {
    const sessaoAdminId = await criarSessaoAdmin();
    await injetarSessao(context, sessaoAdminId);

    await page.goto('/usuarios');

    await expect(page.getByText('Nenhum usuário cadastrado além do admin global.')).toBeVisible();
  });

  test('SCN-003.1 — lista de usuários exibida para o admin global, sem ações de editar ou excluir', async ({ page, context }) => {
    const sessaoAdminId = await criarSessaoAdmin();
    const cpf = documentoUnico(11);
    await criarUsuario(sessaoAdminId, cpf, 'senha12345');

    await injetarSessao(context, sessaoAdminId);
    await page.goto('/usuarios');

    const linha = page.getByRole('row', { name: new RegExp(cpf) });
    await expect(linha).toBeVisible();
    await expect(linha.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await expect(linha.getByRole('button', { name: 'Excluir' })).toHaveCount(0);
  });

  test('SCN-003.3 — usuário comum não pode acessar a lista de usuários', async ({ page, context }) => {
    const sessaoAdminId = await criarSessaoAdmin();
    const cpfUsuario = documentoUnico(11);
    await criarUsuario(sessaoAdminId, cpfUsuario, 'senha12345');
    const sessaoUsuarioId = await criarSessaoUsuario(cpfUsuario, 'senha12345');

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/usuarios');

    // Acesso recusado: a tela de gestão de usuários (exclusiva do admin global, RN-006) não
    // chega a aparecer para um usuário comum.
    await expect(page.getByRole('heading', { name: 'Gestão de usuários' })).not.toBeVisible();
  });
});
