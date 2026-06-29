import { Navigate } from 'react-router-dom'
import { getSession } from '../lib/auth.js'

export default function RequireAdmin({ children }) {
  const sessao = getSession()

  if (!sessao) {
    return <Navigate to="/login" replace />
  }

  return sessao.is_admin ? children : <Navigate to="/anuncios" replace />
}
