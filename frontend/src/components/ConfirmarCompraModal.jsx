import { useState } from 'react'
import Modal from './Modal.jsx'
import { formatBRL } from '../lib/format.js'
import { confirmarCompra } from '../lib/api.js'

// Este modal so confirma a compra do anuncio (POST /vendas). O contrato nao
// modela parcelamento automatico nem dados de cartao - pagamento e um passo
// separado, feito depois em "Minhas Compras" (uma chamada por parcela a
// POST /vendas/{id_venda}/pagamentos).
export default function ConfirmarCompraModal({ anuncio, onFechar, onSucesso }) {
  const [erro, setErro] = useState('')
  const [processando, setProcessando] = useState(false)

  function fechar() {
    if (processando) return
    onFechar()
  }

  async function confirmar(e) {
    e.preventDefault()
    setErro('')
    setProcessando(true)
    try {
      await confirmarCompra(anuncio.id_anuncio)
      onSucesso(
        `Compra confirmada para ${anuncio.carro.marca} ${anuncio.carro.modelo} no valor de ${formatBRL(anuncio.valor_anunciado)}. Registre o pagamento em Minhas Compras.`,
      )
    } catch (err) {
      setErro(err.message)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <Modal titulo="Confirmar compra" onFechar={fechar}>
      <form onSubmit={confirmar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && <div className="alert-error">{erro}</div>}

        <div style={{ display: 'grid', gap: 4 }}>
          <strong>
            {anuncio.carro.marca} {anuncio.carro.modelo}
          </strong>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {anuncio.carro.ano} · {formatBRL(anuncio.valor_anunciado)}
          </span>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
          Ao confirmar, a compra e registrada em seu nome. O pagamento (em uma
          ou mais parcelas) e feito separadamente, na tela Minhas Compras.
        </p>

        <button type="submit" className="btn btn-primary" disabled={processando}>
          {processando ? 'Confirmando...' : 'Confirmar compra'}
        </button>
      </form>
    </Modal>
  )
}