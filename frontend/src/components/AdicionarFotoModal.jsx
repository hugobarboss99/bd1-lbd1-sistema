import { useState } from 'react'
import { adicionarFoto } from '../lib/api.js'
import Modal from './Modal.jsx'

export default function AdicionarFotoModal({ chassi, onFechar, onSucesso }) {
  const [url, setUrl] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const r = await adicionarFoto(chassi, url.trim())
      onSucesso(`Foto ${r.sequencia_foto} adicionada.`)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Adicionar foto" onFechar={onFechar}>
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && <div className="alert-error">{erro}</div>}
        <div className="field">
          <label htmlFor="url_foto">URL da foto</label>
          <input
            id="url_foto"
            className="input"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Adicionando...' : 'Adicionar'}
        </button>
      </form>
    </Modal>
  )
}
