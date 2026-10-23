import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const TAMANHO_SAL = 16;
const TAMANHO_HASH = 64;

// Formato: <salt-hex>:<hash-hex>. Compartilhado entre o seed (cria o 1º admin_global) e o
// domínio sessao (confere a senha no login) — nunca duplicado entre os dois.
export function gerarHash(senha: string): string {
  const sal = randomBytes(TAMANHO_SAL);
  const hash = scryptSync(senha, sal, TAMANHO_HASH);
  return `${sal.toString('hex')}:${hash.toString('hex')}`;
}

export function conferirSenha(senha: string, senhaHash: string): boolean {
  const [salHex, hashHex] = senhaHash.split(':');
  if (!salHex || !hashHex) {
    return false;
  }
  const sal = Buffer.from(salHex, 'hex');
  const hashEsperado = Buffer.from(hashHex, 'hex');
  const hashInformado = scryptSync(senha, sal, TAMANHO_HASH);
  return (
    hashInformado.length === hashEsperado.length &&
    timingSafeEqual(hashInformado, hashEsperado)
  );
}
