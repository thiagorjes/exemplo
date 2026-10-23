import type { BrowserContext, Page } from '@playwright/test';

/**
 * Injeta uma sessão já criada via API (ver fixtures/api.ts) como o cookie `__Host-sessao` que
 * o BFF normalmente emitiria após o login pela tela. Usado nos specs que não estão testando o
 * login em si (RF-002 em diante) — evita repetir a jornada de login em todo teste e mantém cada
 * spec focado no comportamento do seu próprio RF.
 */
export async function injetarSessao(context: BrowserContext, sessaoId: string): Promise<void> {
  await context.addCookies([
    {
      name: '__Host-sessao',
      value: sessaoId,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    },
  ]);
}

/** Jornada real de login pela UI — usada só em login.spec.ts, que é quem testa esse fluxo. */
export async function entrarPelaTela(page: Page, cpf: string, senha: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('CPF').fill(cpf);
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
}
