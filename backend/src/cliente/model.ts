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
