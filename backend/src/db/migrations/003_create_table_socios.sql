CREATE TABLE socios (
  id TEXT PRIMARY KEY,
  cliente_id TEXT NOT NULL REFERENCES clientes(id),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  UNIQUE (cliente_id, cpf)
);
CREATE INDEX idx_socios_cliente_id ON socios (cliente_id);
