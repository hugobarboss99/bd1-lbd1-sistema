import { useState } from 'react'
import { registrarPagamento } from '../lib/api.js'
import { formatBRL } from '../lib/format.js'
import Modal from './Modal.jsx'

// Formas aceitas pelo backend (ver PagamentoRequest em models.py / Tela 9.2
// do contrato). Nao ha campo de numero de cartao, validade etc - o backend
// so registra valor + tipo_pagamento por parcela.
const TIPOS_PAGAMENTO = [
  { valor: 'DINHEIRO', label: 'Dinheiro' },
  { valor: 'PIX', label: 'PIX' },
  { valor: 'CARTAO', label: 'Cartao' },
  { valor: 'BOLETO', label: 'Boleto' },
  { valor: 'FINANCIAMENTO', label: 'Financiamento' },
]

export default function RegistrarPagamentoModal({ idVenda, saldoPendente, onFechar, onSucesso }) {
  const [valor, setValor] = useState(saldoPendente > 0 ? String(saldoPendente) : '')
  const [tipoPagamento, setTipoPagamento] = useState('PIX')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await registrarPagamento(idVenda, {
        valor: Number(valor),
        tipo_pagamento: tipoPagamento,
      })
      onSucesso('Pagamento registrado.')
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal titulo="Registrar pagamento" onFechar={onFechar}>
      <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && <div className="alert-error">{erro}</div>}

        {saldoPendente > 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
            Saldo pendente: {formatBRL(saldoPendente)}
          </p>
        )}

        <div className="field">
          <label htmlFor="valor_pagamento">Valor da parcela (R$)</label>
          <input
            id="valor_pagamento"
            type="number"
            step="0.01"
            min="0.01"
            className="input"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="tipo_pagamento">Forma de pagamento</label>
          <select
            id="tipo_pagamento"
            className="input"
            value={tipoPagamento}
            onChange={(e) => setTipoPagamento(e.target.value)}
          >
            {TIPOS_PAGAMENTO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Registrando...' : 'Registrar pagamento'}
        </button>
      </form>
    </Modal>
  )
}