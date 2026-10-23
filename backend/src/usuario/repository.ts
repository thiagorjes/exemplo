import { randomUUID } from 'node:crypto';
import { db } from '../db/connection';
import type { Papel } from '../sessao/model';
import type { UsuarioCriado, UsuarioResumo } from './model';

interface LinhaUsuario {
  id: string;
  cpf: string;
  papel: Papel;
  criado_em: string;
}

// Fonte canônica de acesso à tabela `usuarios` por CPF — o domínio `sessao` (TASK-01.3, que
// nasceu antes deste domínio existir) importa daqui, em vez de manter cópia própria.
export function buscarUsuarioPorCpf(
  cpf: string,
): { id: string; senhaHash: string; papel: Papel } | undefined {
  const linha = db
    .prepare('SELECT id, senha_hash, papel FROM usuarios WHERE cpf = ?')
    .get(cpf) as { id: string; senha_hash: string; papel: Papel } | undefined;

  if (!linha) {
    return undefined;
  }
  return { id: linha.id, senhaHash: linha.senha_hash, papel: linha.papel };
}

export function criarUsuario(dados: { cpf: string; senhaHash: string }): UsuarioCriado {
  const id = randomUUID();
  const criadoEm = new Date().toISOString();

  db.prepare(
    'INSERT INTO usuarios (id, cpf, senha_hash, papel, criado_em) VALUES (?, ?, ?, ?, ?)',
  ).run(id, dados.cpf, dados.senhaHash, 'usuario', criadoEm);

  return { id, cpf: dados.cpf, papel: 'usuario', criadoEm };
}

export function listarUsuarios(): UsuarioResumo[] {
  const linhas = db
    .prepare('SELECT id, cpf, papel, criado_em FROM usuarios ORDER BY criado_em')
    .all() as unknown as LinhaUsuario[];

  return linhas.map((linha) => ({
    id: linha.id,
    cpf: linha.cpf,
    papel: linha.papel,
    criadoEm: linha.criado_em,
  }));
}
