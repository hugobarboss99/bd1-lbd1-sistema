import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { cadastrar } from '../lib/api.js'
import styles from './Cadastro.module.css'

const CAMPOS = [
  { nome: 'nome', label: 'Nome completo', tipo: 'text' },
  { nome: 'cpf', label: 'CPF', tipo: 'text', maxLength: 11, inputMode: 'numeric' },
  { nome: 'telefone', label: 'Telefone', tipo: 'tel', inputMode: 'numeric' },
  { nome: 'login', label: 'Login', tipo: 'text' },
  { nome: 'senha', label: 'Senha', tipo: 'password' },
]

const VAZIO = { nome: '', cpf: '', telefone: '', login: '', senha: '' }

export default function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState(VAZIO)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  function atualizar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await cadastrar(form)
      navigate('/login', { state: { cadastrado: true } })
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={`card ${styles.box}`} onSubmit={enviar}>
        <div className={styles.brand}>
          <span className={styles.logo}>AutoTroca</span>
          <p className={styles.subtitle}>Crie sua conta para comprar e vender</p>
        </div>

        {erro && <div className="alert-error">{erro}</div>}

        {CAMPOS.map((c) => (
          <div className="field" key={c.nome}>
            <label htmlFor={c.nome}>{c.label}</label>
            <input
              id={c.nome}
              type={c.tipo}
              className="input"
              value={form[c.nome]}
              onChange={atualizar(c.nome)}
              maxLength={c.maxLength}
              inputMode={c.inputMode}
              required
            />
          </div>
        ))}

        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>

        <p className={styles.footer}>
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  )
}
