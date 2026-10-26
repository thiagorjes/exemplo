// Nomes compartilhados entre cliente e servidor — por isso ficam separados de `csrf.ts`
// (que importa `next/headers`, exclusivo de Server Component/Route Handler e proibido em
// módulo importado por Client Component).
export const NOME_COOKIE_CSRF = 'XSRF-TOKEN';
export const CABECALHO_CSRF = 'X-XSRF-TOKEN';
