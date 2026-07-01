const KEY = 'autotroca.session'

function decodificarPayloadJWT(token) {
  try {
    const payloadBase64 = token.split('.')[1]
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

export function saveSession({ token, cpf, nome }) {
  const payload = decodificarPayloadJWT(token)
  const is_admin = payload?.tipo === 'ADMIN'

  localStorage.setItem(KEY, JSON.stringify({ token, cpf, nome, is_admin }))
}

export function getSession() {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearSession() {
  localStorage.removeItem(KEY)
}

export function getToken() {
  return getSession()?.token ?? null
}