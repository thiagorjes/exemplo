import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { db } from './connection';

const DIRETORIO_MIGRATIONS = join(process.cwd(), 'src', 'db', 'migrations');

function garantirTabelaControle(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      nome TEXT PRIMARY KEY,
      aplicada_em TEXT
    );
  `);
}

function jaAplicada(nome: string): boolean {
  const linha = db
    .prepare('SELECT 1 FROM _migrations WHERE nome = ?')
    .get(nome);
  return linha !== undefined;
}

function aplicar(nome: string, sql: string): void {
  db.exec('BEGIN');
  try {
    db.exec(sql);
    db.prepare('INSERT INTO _migrations (nome, aplicada_em) VALUES (?, ?)').run(
      nome,
      new Date().toISOString(),
    );
    db.exec('COMMIT');
    // eslint-disable-next-line no-console
    console.log(`Migration aplicada: ${nome}`);
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}

function migrar(): void {
  garantirTabelaControle();

  const arquivos = readdirSync(DIRETORIO_MIGRATIONS)
    .filter((arquivo) => arquivo.endsWith('.sql'))
    .sort();

  for (const arquivo of arquivos) {
    if (jaAplicada(arquivo)) {
      continue;
    }
    const sql = readFileSync(join(DIRETORIO_MIGRATIONS, arquivo), 'utf8');
    aplicar(arquivo, sql);
  }

  // eslint-disable-next-line no-console
  console.log('Migrations em dia.');
}

migrar();
