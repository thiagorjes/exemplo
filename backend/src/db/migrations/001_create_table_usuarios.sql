CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  cpf TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('admin_global','usuario')),
  criado_em TEXT NOT NULL
);
