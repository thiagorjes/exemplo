import type { Papel } from '../sessao/model';

export type UsuarioCriado = { id: string; cpf: string; papel: 'usuario'; criadoEm: string };
export type UsuarioResumo = { id: string; cpf: string; papel: Papel; criadoEm: string };
