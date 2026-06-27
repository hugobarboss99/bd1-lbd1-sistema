import { useState } from 'react'
import { editarAnuncio } from '../lib/api.js'
import Modal from './Modal.jsx'

export default function EditarAnuncioModal({ id, valorAtual, onFechar, onSucesso }) {
  const [valor, setValor] = useState(String(valorAtual))
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      const r = await editarAnuncio(id, Number(valor))
      onSucesso(r.valor_anunciado)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Editar anuncio" onFechar={onFechar}>
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
          {enviando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </Modal>
  )
}
