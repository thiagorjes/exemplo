// O prefixo `__Host-` e `secure: true` exigem HTTPS (`frontend/_shared/spa-bff.md` §3) — esta
// demo roda em http://localhost. Em produção real (NODE_ENV=production) usa o nome e a flag
// corretos; fora disso, cai para um cookie comum para o cookie realmente ser gravado pelo browser.
const PRODUCAO = process.env.NODE_ENV === 'production';

export const NOME_COOKIE_SESSAO = PRODUCAO ? '__Host-sessao' : 'sessao';

export const OPCOES_COOKIE_SESSAO = {
  httpOnly: true,
  secure: PRODUCAO,
  sameSite: 'strict' as const,
  path: '/',
};
