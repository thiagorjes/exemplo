import { randomUUID } from 'node:crypto';
import { db } from '../db/connection';
import type { Cliente, DadosCliente } from './model';

interface LinhaCliente {
  id: string;
  tipo: 'PF' | 'PJ';
  documento: string;
  nome_completo: string | null;
  data_nascimento: string | null;
  nome_fantasia: string | null;
  razao_social: string | null;
  data_abertura: string | null;
  endereco: string;
  telefone: string;
  criado_em: string;
  atualizado_em: string;
}

interface LinhaSocio {
  nome_completo: string;
  cpf: string;
}

function buscarSocios(clienteId: string): { nomeCompleto: string; cpf: string }[] {
  const linhas = db
    .prepare('SELECT nome_completo, cpf FROM socios WHERE cliente_id = ?')
    .all(clienteId) as unknown as LinhaSocio[];
  return linhas.map((linha) => ({ nomeCompleto: linha.nome_completo, cpf: linha.cpf }));
}

function montarCliente(linha: LinhaCliente): Cliente {
  if (linha.tipo === 'PF') {
    return {
      id: linha.id,
      tipo: 'PF',
      documento: linha.documento,
      nomeCompleto: linha.nome_completo as string,
      dataNascimento: linha.data_nascimento as string,
      endereco: linha.endereco,
      telefone: linha.telefone,
      criadoEm: linha.criado_em,
      atualizadoEm: linha.atualizado_em,
    };
  }

  return {
    id: linha.id,
    tipo: 'PJ',
    documento: linha.documento,
    nomeFantasia: linha.nome_fantasia as string,
    razaoSocial: linha.razao_social as string,
    dataAbertura: linha.data_abertura as string,
    endereco: linha.endereco,
    telefone: linha.telefone,
    socios: buscarSocios(linha.id),
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
  };
}

function inserirSocios(clienteId: string, socios: { nomeCompleto: string; cpf: string }[]): void {
  const inserir = db.prepare(
    'INSERT INTO socios (id, cliente_id, nome_completo, cpf) VALUES (?, ?, ?, ?)',
  );
  for (const socio of socios) {
    inserir.run(randomUUID(), clienteId, socio.nomeCompleto, socio.cpf);
  }
}

export function inserirCliente(dados: DadosCliente): Cliente {
  const id = randomUUID();
  const agora = new Date().toISOString();

  db.exec('BEGIN');
  try {
    if (dados.tipo === 'PF') {
      db.prepare(
        `INSERT INTO clientes (id, tipo, documento, nome_completo, data_nascimento, endereco, telefone, criado_em, atualizado_em)
         VALUES (?, 'PF', ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, dados.documento, dados.nomeCompleto, dados.dataNascimento, dados.endereco, dados.telefone, agora, agora);
    } else {
      db.prepare(
        `INSERT INTO clientes (id, tipo, documento, nome_fantasia, razao_social, data_abertura, endereco, telefone, criado_em, atualizado_em)
         VALUES (?, 'PJ', ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(id, dados.documento, dados.nomeFantasia, dados.razaoSocial, dados.dataAbertura, dados.endereco, dados.telefone, agora, agora);
      inserirSocios(id, dados.socios);
    }
    db.exec('COMMIT');
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }

  return buscarPorId(id)!.cliente;
}

export function buscarPorDocumento(documento: string): Cliente | null {
  const linha = db
    .prepare('SELECT * FROM clientes WHERE documento = ?')
    .get(documento) as unknown as LinhaCliente | undefined;
  return linha ? montarCliente(linha) : null;
}

export function listarAtivos(): Cliente[] {
  const linhas = db
    .prepare('SELECT * FROM clientes WHERE excluido_em IS NULL ORDER BY criado_em')
    .all() as unknown as LinhaCliente[];
  return linhas.map(montarCliente);
}

export function buscarPorId(id: string): { cliente: Cliente; excluidoEm: string | null } | null {
  const linha = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id) as unknown as
    | (LinhaCliente & { excluido_em: string | null })
    | undefined;
  if (!linha) {
    return null;
  }
  return { cliente: montarCliente(linha), excluidoEm: linha.excluido_em };
}

export function atualizarCliente(
  id: string,
  dados: DadosCliente,
): Cliente {
  const agora = new Date().toISOString();

  db.exec('BEGIN');
  try {
    if (dados.tipo === 'PF') {
      db.prepare(
        `UPDATE clientes SET documento = ?, nome_completo = ?, data_nascimento = ?, endereco = ?, telefone = ?, atualizado_em = ?
         WHERE id = ?`,
      ).run(dados.documento, dados.nomeCompleto, dados.dataNascimento, dados.endereco, dados.telefone, agora, id);
    } else {
      db.prepare(
        `UPDATE clientes SET documento = ?, nome_fantasia = ?, razao_social = ?, data_abertura = ?, endereco = ?, telefone = ?, atualizado_em = ?
         WHERE id = ?`,
      ).run(dados.documento, dados.nomeFantasia, dados.razaoSocial, dados.dataAbertura, dados.endereco, dados.telefone, agora, id);
      db.prepare('DELETE FROM socios WHERE cliente_id = ?').run(id);
      inserirSocios(id, dados.socios);
    }
    db.exec('COMMIT');
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }

  return buscarPorId(id)!.cliente;
}

export function marcarExcluido(id: string): void {
  db.prepare('UPDATE clientes SET excluido_em = ? WHERE id = ? AND excluido_em IS NULL').run(
    new Date().toISOString(),
    id,
  );
}
