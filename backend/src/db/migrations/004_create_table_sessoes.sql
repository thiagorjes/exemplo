CREATE TABLE sessoes (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  criado_em TEXT NOT NULL,
  ultima_atividade_em TEXT NOT NULL,
  encerrada_em TEXT
);
CREATE INDEX idx_sessoes_usuario_id ON sessoes (usuario_id);
