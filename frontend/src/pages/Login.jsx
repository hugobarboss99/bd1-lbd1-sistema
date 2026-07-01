import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login as loginUsuario, loginAdmin } from '../lib/api.js'
import { saveSession, getSession } from '../lib/auth.js'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ login: '', senha: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const cadastrado = location.state?.cadastrado

  function atualizar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  }

  async function entrar(autenticar) {
    setErro('')
    setEnviando(true)
    try {
      const resposta = await autenticar(form)
      // A resposta crua da API (LoginResponse) so tem token/cpf/nome - nao
      // tem is_admin. saveSession decodifica o JWT e deriva is_admin a
      // partir do campo "tipo" no payload; por isso relemos via
      // getSession() em vez de usar "resposta" diretamente.
      saveSession(resposta)
      const sessao = getSession()
      navigate(sessao.is_admin ? '/admin/usuarios' : '/anuncios')
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.page}>
      <form
        className={`card ${styles.box}`}
        onSubmit={(e) => {
          e.preventDefault()
          entrar(loginUsuario)
        }}
      >
        <div className={styles.brand}>
          <span className={styles.logo}>AutoTroca</span>
          <p className={styles.subtitle}>Compra e venda de carros entre pessoas</p>
        </div>

        {cadastrado && <div className="alert-success">Conta criada! Faca login para continuar.</div>}
        {erro && <div className="alert-error">{erro}</div>}

        <div className="field">
          <label htmlFor="login">Login</label>
          <input
            id="login"
            className="input"
            value={form.login}
            onChange={atualizar('login')}
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            className="input"
            value={form.senha}
            onChange={atualizar('senha')}
            autoComplete="current-password"
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={enviando}
            onClick={() => entrar(loginAdmin)}
          >
            Entrar como administrador
          </button>
        </div>

        <p className={styles.footer}>
          Nao tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  )
}