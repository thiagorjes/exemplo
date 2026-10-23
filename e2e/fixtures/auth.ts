import type { BrowserContext, Page } from '@playwright/test';

/**
 * Injeta uma sessão já criada via API (ver fixtures/api.ts) como o cookie que o BFF normalmente
 * emitiria após o login pela tela. Usado nos specs que não estão testando o login em si (RF-002
 * em diante) — evita repetir a jornada de login em todo teste e mantém cada spec focado no
 * comportamento do seu próprio RF.
 *
 * Emenda (2026-10-23, aprovada por Thiago Cavalcante): nome e `secure` seguiam o padrão de
 * produção (`__Host-sessao`/`secure: true`), que exige HTTPS — o app, em ambiente de
 * desenvolvimento (HTTP local), usa `sessao`/`secure: false` desde a correção do EPIC-01
 * (ver frontend/src/lib/sessao-cookie.ts). Sem este ajuste, a sessão injetada nunca era
 * reconhecida e toda página protegida redirecionava para /login. Ver
 * docs/tests/cadastro-clientes-verificacao.md, Congelamento da suíte.
 */
export async function injetarSessao(context: BrowserContext, sessaoId: string): Promise<void> {
  await context.addCookies([
    {
      name: 'sessao',
      value: sessaoId,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
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
