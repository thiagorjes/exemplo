import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-002 — Admin global cria usuário (docs/prd/cadastro-clientes-prd.md).
 * SCN-002.1, SCN-002.2, SCN-002.3.
 */
test.describe('Criar usuário', () => {
  test('SCN-002.1 — criação de usuário bem-sucedida', async ({ page, context }) => {
    const sessaoAdminId = await criarSessaoAdmin();
    await injetarSessao(context, sessaoAdminId);
    const cpfNovo = documentoUnico(11);

    await page.goto('/usuarios');
    await page.getByLabel('CPF').fill(cpfNovo);
    await page.getByLabel('Senha').fill('senha12345');
    await page.getByRole('button', { name: 'Criar usuário' }).click();

    await expect(page.getByText(cpfNovo)).toBeVisible();
  });

  test('SCN-002.2 — CPF já cadastrado para outro usuário', async ({ page, context }) => {
    const sessaoAdminId = await criarSessaoAdmin();
    const cpfExistente = documentoUnico(11);
    await criarUsuario(sessaoAdminId, cpfExistente, 'senha12345');

    await injetarSessao(context, sessaoAdminId);
    await page.goto('/usuarios');
    await page.getByLabel('CPF').fill(cpfExistente);
    await page.getByLabel('Senha').fill('outrasenha123');
    await page.getByRole('button', { name: 'Criar usuário' }).click();

    // Filtro por texto não vazio: o Next.js App Router injeta um route announcer oculto com
    // role="alert" em toda página — sem o filtro, getByRole('alert') colide com ele em modo
    // estrito (ver emenda de SCN-001.2 em docs/tests/cadastro-clientes-verificacao.md).
    await expect(page.getByRole('alert').filter({ hasText: /.+/ })).toBeVisible();
    // A criação foi recusada: nenhum segundo registro com o mesmo CPF aparece duplicado na
    // lista. Escopado à tabela (getByRole('cell')), não a página inteira — a mensagem de erro
    // acima também cita o CPF em texto livre, o que faria getByText(cpfExistente) contar 2.
    await expect(page.getByRole('cell', { name: cpfExistente, exact: true })).toHaveCount(1);
  });

  test('SCN-002.3 — usuário comum não pode criar usuário', async ({ page, context }) => {
    const sessaoAdminId = await criarSessaoAdmin();
    const cpfUsuario = documentoUnico(11);
    await criarUsuario(sessaoAdminId, cpfUsuario, 'senha12345');
    const sessaoUsuarioId = await criarSessaoUsuario(cpfUsuario, 'senha12345');

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/usuarios');

    // Usuário comum não acessa a tela de gestão de usuários (RN-006) — nada de formulário de
    // criação de usuário fica disponível para ele.
    await expect(page.getByRole('button', { name: 'Criar usuário' })).not.toBeVisible();
  });
});
