import { useState } from 'react'
import { criarAnuncio } from '../lib/api.js'
import Modal from './Modal.jsx'

export default function CriarAnuncioModal({ chassi, onFechar, onSucesso }) {
  const [valor, setValor] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const r = await criarAnuncio({ chassi_carro: chassi, valor_anunciado: Number(valor) })
      onSucesso(`Anuncio ${r.id_anuncio} publicado.`)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Criar anuncio" onFechar={onFechar}>
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && <div className="alert-error">{erro}</div>}
        <div className="field">
          <label htmlFor="valor_anunciado">Valor anunciado (R$)</label>
          <input
            id="valor_anunciado"
            type="number"
            step="0.01"
            className="input"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Publicando...' : 'Publicar anuncio'}
        </button>
      </form>
    </Modal>
  )
}
