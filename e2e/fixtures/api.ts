/**
 * Helpers de arranjo (setup) que falam direto com a API core (backend), sem passar pelo
 * browser — usados só para preparar estado (criar usuário/cliente) antes do teste exercitar
 * a UI de verdade. O que está sob teste em cada spec continua sendo a interação via browser.
 *
 * `X-Sessao-Id` é o header interno que o BFF usaria (ver
 * docs/techspec/cadastro-clientes/quickstart.md, "Um cenário por RF") — não é o que o
 * browser manda (que é o cookie `__Host-sessao`).
 */

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

async function chamar(
  path: string,
  init: RequestInit & { sessaoId?: string } = {},
): Promise<Response> {
  const { sessaoId, headers, ...resto } = init;
  return fetch(`${API_URL}${path}`, {
    ...resto,
    headers: {
      'Content-Type': 'application/json',
      ...(sessaoId ? { 'X-Sessao-Id': sessaoId } : {}),
      ...headers,
    },
  });
}

export async function criarSessaoAdmin(): Promise<string> {
  const cpf = process.env.SEED_ADMIN_CPF;
  const senha = process.env.SEED_ADMIN_SENHA;
  if (!cpf || !senha) {
    throw new Error('SEED_ADMIN_CPF/SEED_ADMIN_SENHA ausentes no ambiente de teste.');
  }
  const res = await chamar('/v1/sessoes', { method: 'POST', body: JSON.stringify({ cpf, senha }) });
  if (!res.ok) throw new Error(`login do admin seed falhou: ${res.status}`);
  const corpo = await res.json();
  return corpo.id as string;
}

export async function criarUsuario(
  sessaoAdminId: string,
  cpf: string,
  senha: string,
): Promise<{ id: string; cpf: string }> {
  const res = await chamar('/v1/usuarios', { method: 'POST', sessaoId: sessaoAdminId, body: JSON.stringify({ cpf, senha }) });
  if (!res.ok) throw new Error(`criação de usuário de teste falhou: ${res.status}`);
  return res.json();
}

export async function criarSessaoUsuario(cpf: string, senha: string): Promise<string> {
  const res = await chamar('/v1/sessoes', { method: 'POST', body: JSON.stringify({ cpf, senha }) });
  if (!res.ok) throw new Error(`login do usuário de teste falhou: ${res.status}`);
  const corpo = await res.json();
  return corpo.id as string;
}

export type ClientePF = {
  tipo: 'PF';
  documento: string;
  nomeCompleto: string;
  dataNascimento: string;
  endereco: string;
  telefone: string;
};

export type ClientePJ = {
  tipo: 'PJ';
  documento: string;
  nomeFantasia: string;
  razaoSocial: string;
  dataAbertura: string;
  endereco: string;
  telefone: string;
  socios: { nomeCompleto: string; cpf: string }[];
};

export async function criarCliente(
  sessaoUsuarioId: string,
  dados: ClientePF | ClientePJ,
): Promise<{ id: string }> {
  const res = await chamar('/v1/clientes', { method: 'POST', sessaoId: sessaoUsuarioId, body: JSON.stringify(dados) });
  if (!res.ok) throw new Error(`criação de cliente de teste falhou: ${res.status}`);
  return res.json();
}

export async function excluirCliente(sessaoUsuarioId: string, id: string): Promise<void> {
  const res = await chamar(`/v1/clientes/${id}`, { method: 'DELETE', sessaoId: sessaoUsuarioId });
  if (res.status !== 204) throw new Error(`exclusão de cliente de teste falhou: ${res.status}`);
}

/** CPF/CNPJ únicos por execução, para não colidir entre specs que rodam contra o mesmo SQLite. */
export function documentoUnico(tamanho: 11 | 14): string {
  let numero = '';
  while (numero.length < tamanho) numero += String(Date.now() + Math.floor(Math.random() * 1000));
  return numero.slice(0, tamanho);
}
