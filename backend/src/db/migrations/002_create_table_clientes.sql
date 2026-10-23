CREATE TABLE clientes (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('PF','PJ')),
  documento TEXT NOT NULL UNIQUE,
  nome_completo TEXT,
  data_nascimento TEXT,
  nome_fantasia TEXT,
  razao_social TEXT,
  data_abertura TEXT,
  endereco TEXT NOT NULL,
  telefone TEXT NOT NULL,
  criado_em TEXT NOT NULL,
  atualizado_em TEXT NOT NULL,
  excluido_em TEXT
);
CREATE INDEX idx_clientes_excluido_em ON clientes (excluido_em);
