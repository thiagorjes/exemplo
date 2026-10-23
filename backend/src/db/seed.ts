import { randomUUID } from 'node:crypto';
import { gerarHash } from '../core/senha';
import { db } from './connection';

function seed(): void {
  const cpf = process.env.SEED_ADMIN_CPF;
  const senha = process.env.SEED_ADMIN_SENHA;

  if (!cpf || !senha) {
    // eslint-disable-next-line no-console
    console.error('SEED_ADMIN_CPF e SEED_ADMIN_SENHA precisam estar definidas.');
    process.exit(1);
  }

  const existente = db
    .prepare("SELECT 1 FROM usuarios WHERE papel = 'admin_global'")
    .get();

  if (existente !== undefined) {
    // eslint-disable-next-line no-console
    console.log('Seed já aplicado — já existe um admin_global.');
    return;
  }

  db.prepare(
    'INSERT INTO usuarios (id, cpf, senha_hash, papel, criado_em) VALUES (?, ?, ?, ?, ?)',
  ).run(randomUUID(), cpf, gerarHash(senha), 'admin_global', new Date().toISOString());

  // eslint-disable-next-line no-console
  console.log('admin_global criado.');
}

seed();
