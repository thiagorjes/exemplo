import { test, expect } from '@playwright/test';
import { criarSessaoAdmin, criarUsuario, criarSessaoUsuario, criarCliente, documentoUnico } from '../fixtures/api';
import { injetarSessao } from '../fixtures/auth';

/**
 * RF-005 — Usuário inclui cliente Pessoa Jurídica, com sócios (docs/prd/cadastro-clientes-prd.md).
 * SCN-005.1, SCN-005.2, SCN-005.3. Lista dinâmica de sócios: DDR-001
 * (docs/decisions/DDR-001-lista-dinamica-de-socios.md) — "+ Adicionar sócio" sem limite.
 */
async function novoUsuarioAutenticado() {
  const sessaoAdminId = await criarSessaoAdmin();
  const cpf = documentoUnico(11);
  await criarUsuario(sessaoAdminId, cpf, 'senha12345');
  return criarSessaoUsuario(cpf, 'senha12345');
}

test.describe('Incluir cliente — Pessoa Jurídica', () => {
  test('SCN-005.1 — inclusão de cliente Pessoa Jurídica bem-sucedida', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    await injetarSessao(context, sessaoUsuarioId);
    const documento = documentoUnico(14);

    await page.goto('/clientes/novo');
    await page.getByRole('button', { name: 'Pessoa Jurídica' }).click();
    await page.getByLabel('Nome fantasia').fill('Padaria Boa');
    await page.getByLabel('Razão social').fill('Padaria Boa LTDA');
    await page.getByLabel('CNPJ').fill(documento);
    await page.getByLabel('Data de abertura').fill('2020-01-01');
    await page.getByLabel('Endereço').fill('Rua B, 45');
    await page.getByLabel('Telefone').fill('27988888888');

    await page.getByRole('button', { name: '+ Adicionar sócio' }).click();
    await page.getByLabel('Nome completo do sócio').first().fill('João Souza');
    await page.getByLabel('CPF do sócio').first().fill(documentoUnico(11));

    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    await expect(page).toHaveURL(/\/clientes(?!\/novo)/);
    await expect(page.getByText(documento)).toBeVisible();
  });

  test('SCN-005.2 — CNPJ já cadastrado para outro cliente', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    const documento = documentoUnico(14);
    await criarCliente(sessaoUsuarioId, {
      tipo: 'PJ',
      documento,
      nomeFantasia: 'Empresa Existente',
      razaoSocial: 'Empresa Existente LTDA',
      dataAbertura: '2019-01-01',
      endereco: 'Rua D, 10',
      telefone: '27966666666',
      socios: [{ nomeCompleto: 'Sócio Original', cpf: documentoUnico(11) }],
    });

    await injetarSessao(context, sessaoUsuarioId);
    await page.goto('/clientes/novo');
    await page.getByRole('button', { name: 'Pessoa Jurídica' }).click();
    await page.getByLabel('Nome fantasia').fill('Outra Empresa');
    await page.getByLabel('Razão social').fill('Outra Empresa LTDA');
    await page.getByLabel('CNPJ').fill(documento);
    await page.getByLabel('Data de abertura').fill('2021-01-01');
    await page.getByLabel('Endereço').fill('Rua E, 20');
    await page.getByLabel('Telefone').fill('27955555555');
    await page.getByRole('button', { name: '+ Adicionar sócio' }).click();
    await page.getByLabel('Nome completo do sócio').first().fill('Outro Sócio');
    await page.getByLabel('CPF do sócio').first().fill(documentoUnico(11));
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    // Filtro por texto não vazio: o Next.js App Router injeta um route announcer oculto com
    // role="alert" em toda página — sem o filtro, getByRole('alert') colide com ele em modo
    // estrito (ver emenda de SCN-001.2 em docs/tests/cadastro-clientes-verificacao.md).
    await expect(page.getByRole('alert').filter({ hasText: /.+/ })).toBeVisible();
    await expect(page).toHaveURL(/\/clientes\/novo/);
  });

  test('SCN-005.3 — Pessoa Jurídica sem nenhum sócio informado', async ({ page, context }) => {
    const sessaoUsuarioId = await novoUsuarioAutenticado();
    await injetarSessao(context, sessaoUsuarioId);

    await page.goto('/clientes/novo');
    await page.getByRole('button', { name: 'Pessoa Jurídica' }).click();
    await page.getByLabel('Nome fantasia').fill('Empresa Sem Sócio');
    await page.getByLabel('Razão social').fill('Empresa Sem Sócio LTDA');
    await page.getByLabel('CNPJ').fill(documentoUnico(14));
    await page.getByLabel('Data de abertura').fill('2022-01-01');
    await page.getByLabel('Endereço').fill('Rua F, 30');
    await page.getByLabel('Telefone').fill('27944444444');
    // Nenhum sócio adicionado de propósito.
    await page.getByRole('button', { name: 'Salvar cliente' }).click();

    await expect(page.getByText('Adicione ao menos um sócio — é dado mínimo obrigatório para Pessoa Jurídica.')).toBeVisible();
    await expect(page).toHaveURL(/\/clientes\/novo/);
  });
});
