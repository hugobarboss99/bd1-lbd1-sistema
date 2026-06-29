"""
Schemas Pydantic - definem o formato dos JSONs de entrada (Request) e
saida (Response) de cada endpoint, conforme o contrato em
docs/divisao_telas_endpoints.md.

O FastAPI usa essas classes para:
1. Validar automaticamente o JSON recebido (campos obrigatorios, tipos)
2. Gerar a documentacao automatica em /docs
3. Serializar a resposta de volta para JSON
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


# ============================================================
# AUTENTICACAO E CADASTRO
# ============================================================

class LoginRequest(BaseModel):
    login: str
    senha: str


class LoginResponse(BaseModel):
    token: str
    cpf: str
    nome: str


class CadastroRequest(BaseModel):
    cpf: str = Field(..., min_length=11, max_length=11)
    nome: str
    telefone: Optional[str] = None
    login: str
    senha: str = Field(..., min_length=6)


class CadastroResponse(BaseModel):
    cpf: str
    nome: str
    login: str


# ============================================================
# CARROS 
# ============================================================

class FotoCarro(BaseModel):
    url_foto: str


class CarroCreateRequest(BaseModel):
    chassi: str = Field(..., min_length=17, max_length=17)
    marca: str
    modelo: str
    ano: int
    km_rodados: int = 0
    placa: str
    cor: Optional[str] = None
    fotos: Optional[list[str]] = [] 


class CarroCreateResponse(BaseModel):
    chassi: str
    fotos_cadastradas: int


class CarroMeuResponse(BaseModel):
    chassi: str
    marca: str
    modelo: str
    ano: int
    km_rodados: int
    placa: str
    cor: Optional[str]
    tem_anuncio_ativo: bool
    fotos: list[str]


class AdicionarFotoRequest(BaseModel):
    url_foto: str


class AdicionarFotoResponse(BaseModel):
    chassi_carro: str
    sequencia_foto: int


class ManutencaoRequest(BaseModel):
    descricao: str
    custo: float = Field(..., gt=0)


class ManutencaoResponse(BaseModel):
    chassi_carro: str
    sequencia_manutencao: int


# ============================================================
# ANUNCIOS 
# ============================================================

class CarroResumo(BaseModel):
    marca: str
    modelo: str
    ano: int
    km_rodados: int


class AnuncioListaResponse(BaseModel):
    id_anuncio: int
    valor_anunciado: float
    data_publicacao: datetime
    foto_capa: Optional[str]
    carro: CarroResumo


class PessoaResumo(BaseModel):
    cpf: str
    nome: str


class CarroDetalhe(BaseModel):
    chassi: str
    marca: str
    modelo: str
    ano: int
    km_rodados: int
    placa: str
    cor: Optional[str]
    fotos: list[str]


class ManutencaoResumo(BaseModel):
    descricao: str
    custo: float
    data_manutencao: datetime


class AnuncioDetalheResponse(BaseModel):
    id_anuncio: int
    valor_anunciado: float
    data_publicacao: datetime
    status: str
    anunciante: PessoaResumo
    carro: CarroDetalhe
    manutencoes: list[ManutencaoResumo]


class AnuncioCreateRequest(BaseModel):
    chassi_carro: str = Field(..., min_length=17, max_length=17)
    valor_anunciado: float = Field(..., gt=0)


class AnuncioCreateResponse(BaseModel):
    id_anuncio: int
    status: str


class AnuncioUpdateRequest(BaseModel):
    valor_anunciado: float = Field(..., gt=0)


class AnuncioUpdateResponse(BaseModel):
    id_anuncio: int
    valor_anunciado: float


# ============================================================
# VENDAS E PAGAMENTOS 
# ============================================================

class VendaCreateRequest(BaseModel):
    id_anuncio: int


class VendaCreateResponse(BaseModel):
    id_venda: int
    id_anuncio: int
    valor: float
    data_venda: datetime


class PagamentoRequest(BaseModel):
    valor: float = Field(..., gt=0)
    tipo_pagamento: str  # "DINHEIRO", "CARTAO", "BOLETO", "FINANCIAMENTO", "PIX"


class PagamentoResponse(BaseModel):
    id_venda: int
    parcela: int
    valor: float
    status_pagamento: str


class PagamentoResumo(BaseModel):
    parcela: int
    valor: float
    status_pagamento: str


class CarroResumoVenda(BaseModel):
    marca: str
    modelo: str
    placa: str


class MinhaCompraResponse(BaseModel):
    id_venda: int
    valor: float
    data_venda: datetime
    carro: CarroResumoVenda
    pagamentos: list[PagamentoResumo]


class CompradorResumo(BaseModel):
    nome: str


class MinhaVendaResponse(BaseModel):
    id_venda: int
    id_anuncio: int
    valor: float
    data_venda: datetime
    comprador: CompradorResumo


# ============================================================
# ADMINISTRACAO 
# ============================================================

class UsuarioAdminResponse(BaseModel):
    cpf: str
    nome: str
    login: str
    status_conta: str
    data_cadastro: datetime


class StatusContaRequest(BaseModel):
    status_conta: str  # "ATIVO" ou "BLOQUEADO"


class StatusContaResponse(BaseModel):
    cpf: str
    status_conta: str


class AnuncioAdminResponse(BaseModel):
    id_anuncio: int
    valor_anunciado: float
    status: str
    anunciante: PessoaResumo


# ============================================================
# ERRO PADRAO 
# ============================================================

class ErroResponse(BaseModel):
    erro: str