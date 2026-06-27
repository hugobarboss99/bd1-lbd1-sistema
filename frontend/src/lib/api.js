import { getToken, getSession } from './auth.js'
import { ANUNCIOS, MEUS_CARROS, MINHAS_COMPRAS } from './mockData.js'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
// Mock ligado por padrao: backend ainda nao existe. Desliga com VITE_USE_MOCK=false.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Erro de API carrega a mensagem do JSON { "erro": ... } que o back retorna,
// pra UI conseguir mostrar direto pro usuario.
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function http(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.erro ?? 'Erro inesperado.', res.status)
  }
  return data
}

export function login(credenciais) {
  if (USE_MOCK) return mockLogin(credenciais, false)
  return http('/auth/login', { method: 'POST', body: credenciais })
}

export function loginAdmin(credenciais) {
  if (USE_MOCK) return mockLogin(credenciais, true)
  return http('/auth/login/adm', { method: 'POST', body: credenciais })
}

export function cadastrar(dados) {
  if (USE_MOCK) return mockCadastro(dados)
  return http('/auth/cadastro', { method: 'POST', body: dados })
}

export function obterAnuncio(id) {
  if (USE_MOCK) return mockObterAnuncio(id)
  return http(`/anuncios/${id}`)
}

export function listarMeusCarros() {
  if (USE_MOCK) return mockListarMeusCarros()
  return http('/carros/meus')
}

export function cadastrarCarro(dados) {
  if (USE_MOCK) return mockCadastrarCarro(dados)
  return http('/carros', { method: 'POST', body: dados })
}

export function listarMinhasCompras() {
  if (USE_MOCK) return mockLista(MINHAS_COMPRAS)
  return http('/vendas/minhas-compras')
}

export function criarAnuncio(dados) {
  if (USE_MOCK) return mockCriarAnuncio(dados)
  return http('/anuncios', { method: 'POST', body: dados })
}

export function adicionarFoto(chassi, url_foto) {
  if (USE_MOCK) return mockAdicionarFoto(chassi, url_foto)
  return http(`/carros/${chassi}/fotos`, { method: 'POST', body: { url_foto } })
}

export function registrarManutencao(chassi, dados) {
  if (USE_MOCK) return mockRegistrarManutencao(chassi, dados)
  return http(`/carros/${chassi}/manutencoes`, { method: 'POST', body: dados })
}

export function listarAnuncios(filtros = {}) {
  if (USE_MOCK) return mockListarAnuncios(filtros)
  const qs = new URLSearchParams(
    Object.entries(filtros).filter(([, v]) => v !== '' && v != null),
  ).toString()
  return http(`/anuncios${qs ? `?${qs}` : ''}`)
}

//Mock

function mockLogin({ login, senha }, isAdmin) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!login || !senha) {
        reject(new ApiError('Login ou senha invalidos.', 401))
        return
      }
      resolve({
        token: `mock.${isAdmin ? 'admin' : 'user'}.${Date.now()}`,
        cpf: '12345678901',
        nome: isAdmin ? 'Admin Demo' : 'Maria Silva',
        is_admin: isAdmin,
      })
    }, 400)
  })
}

function mockCadastro({ cpf, nome, login }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simula o 409 do contrato pra dar pra testar o caminho de duplicata.
      if (cpf === '12345678901' || login === 'maria.silva') {
        reject(new ApiError('CPF ou login ja cadastrado.', 409))
        return
      }
      resolve({ cpf, nome, login })
    }, 400)
  })
}

function mockAdicionarFoto(chassi, url_foto) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const carro = MEUS_CARROS.find((c) => c.chassi === chassi)
      if (!carro) {
        reject(new ApiError('Carro nao encontrado.', 404))
        return
      }
      carro.fotos.push(url_foto)
      resolve({ chassi_carro: chassi, sequencia_foto: carro.fotos.length })
    }, 400)
  })
}

function mockRegistrarManutencao(chassi, { descricao, custo }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const carro = MEUS_CARROS.find((c) => c.chassi === chassi)
      if (!carro) {
        reject(new ApiError('Carro nao encontrado.', 404))
        return
      }
      carro.manutencoes.push({ descricao, custo, data_manutencao: hoje() })
      resolve({ chassi_carro: chassi, sequencia_manutencao: carro.manutencoes.length })
    }, 400)
  })
}

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

function mockCriarAnuncio({ chassi_carro, valor_anunciado }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const carro = MEUS_CARROS.find((c) => c.chassi === chassi_carro)
      if (!carro) {
        reject(new ApiError('Carro nao encontrado.', 404))
        return
      }
      if (carro.tem_anuncio_ativo) {
        reject(new ApiError('Este veiculo ja possui um anuncio ativo.', 400))
        return
      }
      const sessao = getSession()
      const id_anuncio = Math.max(0, ...ANUNCIOS.map((a) => a.id_anuncio)) + 1
      carro.tem_anuncio_ativo = true
      ANUNCIOS.push({
        id_anuncio,
        valor_anunciado,
        data_publicacao: hoje(),
        status: 'ATIVO',
        anunciante: { cpf: sessao.cpf, nome: sessao.nome },
        carro: { ...carro },
        manutencoes: carro.manutencoes,
      })
      resolve({ id_anuncio, status: 'ATIVO' })
    }, 400)
  })
}

function mockLista(dados) {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...dados]), 400)
  })
}

function mockListarMeusCarros() {
  return mockLista(MEUS_CARROS)
}

function mockCadastrarCarro(dados) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MEUS_CARROS.some((c) => c.chassi === dados.chassi)) {
        reject(new ApiError('Carro ja cadastrado.', 409))
        return
      }
      const fotos = dados.fotos ?? []
      MEUS_CARROS.push({ ...dados, fotos, tem_anuncio_ativo: false })
      resolve({ chassi: dados.chassi, fotos_cadastradas: fotos.length })
    }, 400)
  })
}

function mockObterAnuncio(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const anuncio = ANUNCIOS.find((a) => a.id_anuncio === Number(id))
      if (!anuncio) {
        reject(new ApiError('Anuncio nao encontrado.', 404))
        return
      }
      resolve(anuncio)
    }, 400)
  })
}

function mockListarAnuncios({ marca, modelo, valor_min, valor_max, ano_min, ano_max }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lista = ANUNCIOS.filter((a) => a.status === 'ATIVO')
        .filter((a) => !marca || a.carro.marca.toLowerCase().includes(marca.toLowerCase()))
        .filter((a) => !modelo || a.carro.modelo.toLowerCase().includes(modelo.toLowerCase()))
        .filter((a) => valor_min == null || a.valor_anunciado >= valor_min)
        .filter((a) => valor_max == null || a.valor_anunciado <= valor_max)
        .filter((a) => ano_min == null || a.carro.ano >= ano_min)
        .filter((a) => ano_max == null || a.carro.ano <= ano_max)
        .map((a) => ({
          id_anuncio: a.id_anuncio,
          valor_anunciado: a.valor_anunciado,
          data_publicacao: a.data_publicacao,
          foto_capa: a.carro.fotos[0] ?? null,
          carro: {
            marca: a.carro.marca,
            modelo: a.carro.modelo,
            ano: a.carro.ano,
            km_rodados: a.carro.km_rodados,
          },
        }))
      resolve(lista)
    }, 400)
  })
}
