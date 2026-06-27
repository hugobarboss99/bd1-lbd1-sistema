// Fonte unica dos dados falsos. Telas leem daqui enquanto VITE_USE_MOCK
// estiver ligado. Shapes espelham o contrato da API.

// Carros do usuario logado (mock entra como cpf 12345678901). Mutavel: o
// cadastro de veiculo faz push aqui e persiste ate recarregar a pagina.
export const MEUS_CARROS = [
  {
    chassi: '8AWZZZ377VT001100',
    marca: 'Ford',
    modelo: 'Ka',
    ano: 2017,
    km_rodados: 61000,
    placa: 'XYZ0A01',
    cor: 'Branco',
    tem_anuncio_ativo: false,
    fotos: [],
    manutencoes: [],
  },
  {
    chassi: '8AWZZZ377VT002200',
    marca: 'Renault',
    modelo: 'Sandero',
    ano: 2019,
    km_rodados: 43000,
    placa: 'XYZ0B02',
    cor: 'Prata',
    tem_anuncio_ativo: true,
    fotos: [],
    manutencoes: [],
  },
]

export const MINHAS_COMPRAS = [
  {
    id_venda: 55,
    valor: 35000.0,
    data_venda: '2026-06-26',
    carro: { marca: 'Fiat', modelo: 'Uno', placa: 'ABC1234' },
    pagamentos: [
      { parcela: 1, valor: 17500.0, status_pagamento: 'PAGO' },
      { parcela: 2, valor: 17500.0, status_pagamento: 'PENDENTE' },
    ],
  },
  {
    id_venda: 58,
    valor: 41000.0,
    data_venda: '2026-06-21',
    carro: { marca: 'Hyundai', modelo: 'HB20', placa: 'PQR1234' },
    pagamentos: [{ parcela: 1, valor: 41000.0, status_pagamento: 'PAGO' }],
  },
]

export const MINHAS_VENDAS = [
  {
    id_venda: 60,
    id_anuncio: 4,
    valor: 52000.0,
    data_venda: '2026-06-18',
    comprador: { nome: 'Maria Silva' },
  },
  {
    id_venda: 62,
    id_anuncio: 7,
    valor: 28000.0,
    data_venda: '2026-06-24',
    comprador: { nome: 'Carlos Lima' },
  },
]

export const ANUNCIOS = [
  {
    id_anuncio: 1,
    valor_anunciado: 35000.0,
    data_publicacao: '2026-05-10',
    status: 'ATIVO',
    anunciante: { cpf: '98765432100', nome: 'Joao Souza' },
    carro: {
      chassi: '9BWZZZ377VT004251',
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2018,
      km_rodados: 45000,
      placa: 'ABC1234',
      cor: 'Branco',
      fotos: [],
    },
    manutencoes: [
      { descricao: 'Troca de oleo', custo: 250.0, data_manutencao: '2025-01-15' },
    ],
  },
  {
    id_anuncio: 2,
    valor_anunciado: 62000.0,
    data_publicacao: '2026-05-22',
    status: 'ATIVO',
    anunciante: { cpf: '11122233344', nome: 'Maria Silva' },
    carro: {
      chassi: '9BWZZZ377VT009988',
      marca: 'Volkswagen',
      modelo: 'Golf',
      ano: 2020,
      km_rodados: 28000,
      placa: 'DEF5678',
      cor: 'Prata',
      fotos: [],
    },
    manutencoes: [],
  },
  {
    id_anuncio: 3,
    valor_anunciado: 89000.0,
    data_publicacao: '2026-06-01',
    status: 'ATIVO',
    anunciante: { cpf: '98765432100', nome: 'Joao Souza' },
    carro: {
      chassi: '1HGCM82633A004352',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2021,
      km_rodados: 19500,
      placa: 'GHI9012',
      cor: 'Preto',
      fotos: [],
    },
    manutencoes: [
      { descricao: 'Revisao 20.000 km', custo: 800.0, data_manutencao: '2025-11-03' },
    ],
  },
  {
    id_anuncio: 4,
    valor_anunciado: 48000.0,
    data_publicacao: '2026-06-12',
    status: 'ATIVO',
    anunciante: { cpf: '55566677788', nome: 'Carlos Lima' },
    carro: {
      chassi: '3VWFE21C04M000001',
      marca: 'Chevrolet',
      modelo: 'Onix',
      ano: 2019,
      km_rodados: 52000,
      placa: 'JKL3456',
      cor: 'Vermelho',
      fotos: [],
    },
    manutencoes: [],
  },
  {
    id_anuncio: 5,
    valor_anunciado: 125000.0,
    data_publicacao: '2026-06-18',
    status: 'ATIVO',
    anunciante: { cpf: '11122233344', nome: 'Maria Silva' },
    carro: {
      chassi: 'WBA3A5C50DF000123',
      marca: 'Honda',
      modelo: 'Civic',
      ano: 2022,
      km_rodados: 12000,
      placa: 'MNO7890',
      cor: 'Cinza',
      fotos: [],
    },
    manutencoes: [],
  },
  {
    id_anuncio: 6,
    valor_anunciado: 41000.0,
    data_publicacao: '2026-06-20',
    status: 'ATIVO',
    anunciante: { cpf: '55566677788', nome: 'Carlos Lima' },
    carro: {
      chassi: '9BGKS48U0BG000777',
      marca: 'Hyundai',
      modelo: 'HB20',
      ano: 2019,
      km_rodados: 38000,
      placa: 'PQR1234',
      cor: 'Azul',
      fotos: [],
    },
    manutencoes: [],
  },
]
