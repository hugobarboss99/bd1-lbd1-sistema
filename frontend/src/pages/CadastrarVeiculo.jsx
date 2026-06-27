import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cadastrarCarro } from '../lib/api.js'
import Header from '../components/Header.jsx'
import styles from './CadastrarVeiculo.module.css'

const CAMPOS = [
  { nome: 'chassi', label: 'Chassi', maxLength: 17 },
  { nome: 'marca', label: 'Marca' },
  { nome: 'modelo', label: 'Modelo' },
  { nome: 'ano', label: 'Ano', type: 'number' },
  { nome: 'km_rodados', label: 'Quilometragem', type: 'number' },
  { nome: 'placa', label: 'Placa', maxLength: 7 },
  { nome: 'cor', label: 'Cor' },
]

const VAZIO = { chassi: '', marca: '', modelo: '', ano: '', km_rodados: '', placa: '', cor: '' }

export default function CadastrarVeiculo() {
  const navigate = useNavigate()
  const [form, setForm] = useState(VAZIO)
  const [fotos, setFotos] = useState([''])
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  function atualizar(campo) {
    return (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  }

  function atualizarFoto(i) {
    return (e) => setFotos((fs) => fs.map((url, idx) => (idx === i ? e.target.value : url)))
  }

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await cadastrarCarro({
        ...form,
        ano: Number(form.ano),
        km_rodados: Number(form.km_rodados),
        fotos: fotos.map((u) => u.trim()).filter(Boolean),
      })
      navigate('/carros/meus')
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.titulo}>Cadastrar veiculo</h1>

        <form className={`card ${styles.form}`} onSubmit={enviar}>
          {erro && <div className="alert-error">{erro}</div>}

          {CAMPOS.map((c) => (
            <div className="field" key={c.nome}>
              <label htmlFor={c.nome}>{c.label}</label>
              <input
                id={c.nome}
                type={c.type ?? 'text'}
                className="input"
                value={form[c.nome]}
                onChange={atualizar(c.nome)}
                maxLength={c.maxLength}
                required
              />
            </div>
          ))}

          <div className="field">
            <label>Fotos (URL, opcional)</label>
            {fotos.map((url, i) => (
              <input
                key={i}
                className="input"
                placeholder="https://..."
                value={url}
                onChange={atualizarFoto(i)}
              />
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFotos((fs) => [...fs, ''])}
            >
              Adicionar outra foto
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Salvar veiculo'}
          </button>
        </form>
      </main>
    </>
  )
}
