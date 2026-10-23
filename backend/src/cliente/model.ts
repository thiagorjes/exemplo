export type ClientePF = {
  id: string;
  tipo: 'PF';
  documento: string;
  nomeCompleto: string;
  dataNascimento: string;
  endereco: string;
  telefone: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type ClientePJ = {
  id: string;
  tipo: 'PJ';
  documento: string;
  nomeFantasia: string;
  razaoSocial: string;
  dataAbertura: string;
  endereco: string;
  telefone: string;
  socios: { nomeCompleto: string; cpf: string }[];
  criadoEm: string;
  atualizadoEm: string;
};

export type Cliente = ClientePF | ClientePJ;

// `Omit<Cliente, K>` não distribui sobre a união (perde o discriminante `tipo`) — variante
// distributiva usada em toda assinatura que recebe "dados de cliente sem id/timestamps".
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;
export type DadosCliente = DistributiveOmit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>;
