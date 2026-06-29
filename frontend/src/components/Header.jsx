import { Link, useNavigate } from 'react-router-dom'
import { getSession, clearSession } from '../lib/auth.js'
import styles from './Header.module.css'

export default function Header() {
  const navigate = useNavigate()
  const sessao = getSession()

  function sair() {
    clearSession()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <Link to="/anuncios" className={styles.logo}>
        AutoTroca
      </Link>

      <nav className={styles.nav}>
        {sessao ? (
          <>
            {sessao.is_admin && (
              <Link to="/admin/usuarios" className={styles.link}>
                Administração
              </Link>
            )}
            <Link to="/carros/meus" className={styles.link}>
              Meus Carros
            </Link>
            <Link to="/vendas/minhas-compras" className={styles.link}>
              Minhas Compras
            </Link>
            <Link to="/vendas/minhas-vendas" className={styles.link}>
              Minhas Vendas
            </Link>
            <span className={styles.nome}>{sessao.nome}</span>
            <button type="button" className={styles.sair} onClick={sair}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ width: 'auto' }}>
            Entrar
          </Link>
        )}
      </nav>
    </header>
  )
}
