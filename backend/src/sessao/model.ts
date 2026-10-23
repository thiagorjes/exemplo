export type Papel = 'admin_global' | 'usuario';
export type SessaoCriada = { id: string; usuarioId: string; papel: Papel; criadoEm: string };
export type SessaoValidada = {
  id: string;
  usuarioId: string;
  papel: Papel;
  ultimaAtividadeEm: string;
};
