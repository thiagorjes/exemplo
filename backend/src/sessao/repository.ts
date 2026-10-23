import { randomBytes } from 'node:crypto';
import { db } from '../db/connection';
import type { Papel, SessaoCriada, SessaoValidada } from './model';

interface LinhaSessao {
  id: string;
  usuario_id: string;
  papel: Papel;
  criado_em: string;
  ultima_atividade_em: string;
  encerrada_em: string | null;
}

export function criarSessao(usuarioId: string, papel: Papel): SessaoCriada {
  const id = randomBytes(32).toString('hex');
  const agora = new Date().toISOString();

  db.prepare(
    'INSERT INTO sessoes (id, usuario_id, criado_em, ultima_atividade_em) VALUES (?, ?, ?, ?)',
  ).run(id, usuarioId, agora, agora);

  return { id, usuarioId, papel, criadoEm: agora };
}

export function buscarSessaoPorId(
  id: string,
): (SessaoValidada & { encerradaEm: string | null }) | undefined {
  const linha = db
    .prepare(
      `SELECT s.id, s.usuario_id, u.papel, s.ultima_atividade_em, s.encerrada_em
       FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.id = ?`,
    )
    .get(id) as LinhaSessao | undefined;

  if (!linha) {
    return undefined;
  }

  return {
    id: linha.id,
    usuarioId: linha.usuario_id,
    papel: linha.papel,
    ultimaAtividadeEm: linha.ultima_atividade_em,
    encerradaEm: linha.encerrada_em,
  };
}

export function tocarSessao(id: string): void {
  db.prepare('UPDATE sessoes SET ultima_atividade_em = ? WHERE id = ?').run(
    new Date().toISOString(),
    id,
  );
}

// Idempotente por construção — não falha nem reescreve se a sessão já estava encerrada ou nunca
// existiu (RF-009, SCN-009.2 e SCN-009.3).
export function encerrarSessao(id: string): void {
  db.prepare('UPDATE sessoes SET encerrada_em = ? WHERE id = ? AND encerrada_em IS NULL').run(
    new Date().toISOString(),
    id,
  );
}
