import { useState } from 'react'
import { registrarManutencao } from '../lib/api.js'
import Modal from './Modal.jsx'

export default function RegistrarManutencaoModal({ chassi, onFechar, onSucesso }) {
  const [form, setForm] = useState({ descricao: '', custo: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await registrarManutencao(chassi, {
        descricao: form.descricao.trim(),
        custo: Number(form.custo),
      })
      onSucesso('Manutencao registrada.')
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Registrar manutencao" onFechar={onFechar}>
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && <div className="alert-error">{erro}</div>}
        <div className="field">
          <label htmlFor="descricao">Descricao</label>
          <input
            id="descricao"
            className="input"
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="custo">Custo (R$)</label>
          <input
            id="custo"
            type="number"
            step="0.01"
            className="input"
            value={form.custo}
            onChange={(e) => setForm((f) => ({ ...f, custo: e.target.value }))}
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
