import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, criarCliente, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-004 — Usuário inclui cliente Pessoa Física (docs/prd/cadastro-clientes-prd.md).
 * SCN-004.1, SCN-004.2, SCN-004.3.
 *
 * Assume que só os campos do tipo selecionado (PF ou PJ) existem no DOM a cada momento —
 * renderização condicional por tipo, consistente com o discriminated union Zod da TechSpec
 * (docs/techspec/cadastro-clientes-techspec.md). Se `/implement` optar por manter os dois
 * formulários sempre montados (ocultos por CSS), os seletores por label aqui ficam ambíguos —
 * nesse caso o ajuste é escopar por `getByRole('group', { name: 'Dados da pessoa física' })`.
 */
async function novoUsuarioAutenticado() {
  const sessaoAdminId = await criarSessaoAdmin();
  const cpf = documentoUnico(11);
  await criarUsuario(sessaoAdminId, cpf, 'senha12345');
  return criarSessaoUsuario(cpf, 'senha12345');
}

test.describe('Incluir cliente — Pessoa Física', () => {
  test('SCN-004.1 — inclusão de cliente Pessoa Física bem-sucedida', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    await injetarSessao(context, sessaoUsuarioId);
    const documento = documentoUnico(11);

    await page.goto('/clientes/novo');
    await page.getByRole('button', { name: 'Pessoa Física' }).click();
    await page.getByLabel('Nome completo').fill('Maria Silva Souza');
    await page.getByLabel('CPF').fill(documento);
    await page.getByLabel('Data de nascimento').fill('1990-01-01');
    await page.getByLabel('Endereço').fill('Rua A, 123');
    await page.getByLabel('Telefone').fill('27999999999');
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    await expect(page).toHaveURL(/\/clientes(?!\/novo)/);
    await expect(page.getByText(documento)).toBeVisible();
  });

  test('SCN-004.2 — CPF já cadastrado para outro cliente', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(11);
    await criarCliente(sessaoUsuarioId, {
      tipo: 'PF',
      documento,
      nomeCompleto: 'Cliente Existente',
      dataNascimento: '1985-05-05',
      endereco: 'Rua B, 45',
      telefone: '27988888888',
    });

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes/novo');
    await page.getByRole('button', { name: 'Pessoa Física' }).click();
    await page.getByLabel('Nome completo').fill('Outra Pessoa');
    await page.getByLabel('CPF').fill(documento);
    await page.getByLabel('Data de nascimento').fill('1992-02-02');
    await page.getByLabel('Endereço').fill('Rua C, 77');
    await page.getByLabel('Telefone').fill('27977777777');
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    // Filtro por texto não vazio: o Next.js App Router injeta um route announcer oculto com
    // role="alert" em toda página — sem o filtro, getByRole('alert') colide com ele em modo
    // estrito (ver emenda de SCN-001.2 em docs/tests/cadastro-clientes-verificacao.md).
    await expect(page.getByRole('alert').filter({ hasText: /.+/ })).toBeVisible();
    await expect(page).toHaveURL(/\/clientes\/novo/);
  });

  test('SCN-004.3 — campo obrigatório vazio', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    await injetarSessao(context, sessaoUsuarioId);

    await page.goto('/clientes/novo');
    await page.getByRole('button', { name: 'Pessoa Física' }).click();
    // Deixa "Nome completo" em branco de propósito; preenche o resto.
    await page.getByLabel('CPF').fill(documentoUnico(11));
    await page.getByLabel('Data de nascimento').fill('1990-01-01');
    await page.getByLabel('Endereço').fill('Rua A, 123');
    await page.getByLabel('Telefone').fill('27999999999');
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    await expect(page).toHaveURL(/\/clientes\/novo/);
    await expect(page.getByText('Informe o nome completo.')).toBeVisible();
  });
});
