import { getToken } from './auth.js'

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
