import { useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import { formatBRL } from '../lib/format.js'

const PARCELAS = [1, 2, 3, 4, 6, 8, 12]

export default function ConfirmarCompraModal({ anuncio, onFechar, onSucesso }) {
  const [metodo, setMetodo] = useState('pix')
  const [parcelas, setParcelas] = useState(1)
  const [numeroCartao, setNumeroCartao] = useState('')
  const [nomeCartao, setNomeCartao] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [erro, setErro] = useState('')
  const [processando, setProcessando] = useState(false)

  const valorParcela = useMemo(() => anuncio.valor_anunciado / parcelas, [anuncio.valor_anunciado, parcelas])

  function fechar() {
    if (processando) return
    onFechar()
  }

  async function confirmar(e) {
    e.preventDefault()
    setErro('')
    setProcessando(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 350))

      if (metodo === 'cartao') {
        const camposInvalidos = !numeroCartao || !nomeCartao || !validade || !cvv
        if (camposInvalidos) {
          setErro('Preencha os dados do cartao para continuar.')
          return
        }
      }

      onSucesso(
        `Compra confirmada para ${anuncio.carro.marca} ${anuncio.carro.modelo} no valor de ${formatBRL(anuncio.valor_anunciado)}.`,
      )
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

        <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Metodo de pagamento</legend>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input
              type="radio"
              name="metodo"
              value="pix"
              checked={metodo === 'pix'}
              onChange={() => {
                setMetodo('pix')
                setParcelas(1)
              }}
            />
            <span>PIX</span>
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input
              type="radio"
              name="metodo"
              value="cartao"
              checked={metodo === 'cartao'}
              onChange={() => setMetodo('cartao')}
            />
            <span>Cartao</span>
          </label>
        </fieldset>

        <div className="field">
          <label htmlFor="parcelas">Parcelas</label>
          <select
            id="parcelas"
            className="input"
            value={parcelas}
            disabled={metodo === 'pix'}
            onChange={(e) => setParcelas(Number(e.target.value))}
          >
            {PARCELAS.map((qtd) => (
              <option key={qtd} value={qtd}>
                {qtd}x de {formatBRL(anuncio.valor_anunciado / qtd)}
              </option>
            ))}
          </select>
        </div>

        {metodo === 'cartao' && (
          <>
            <div className="field">
              <label htmlFor="numero_cartao">Numero do cartao</label>
              <input
                id="numero_cartao"
                className="input"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={numeroCartao}
                onChange={(e) => setNumeroCartao(e.target.value)}
                required={metodo === 'cartao'}
              />
            </div>
            <div className="field">
              <label htmlFor="nome_cartao">Nome no cartao</label>
              <input
                id="nome_cartao"
                className="input"
                placeholder="Nome como no cartao"
                value={nomeCartao}
                onChange={(e) => setNomeCartao(e.target.value)}
                required={metodo === 'cartao'}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label htmlFor="validade">Validade</label>
                <input
                  id="validade"
                  className="input"
                  placeholder="MM/AA"
                  value={validade}
                  onChange={(e) => setValidade(e.target.value)}
                  required={metodo === 'cartao'}
                />
              </div>
              <div className="field">
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  className="input"
                  inputMode="numeric"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required={metodo === 'cartao'}
                />
              </div>
            </div>
          </>
        )}

        <div style={{ padding: 12, borderRadius: 10, background: 'var(--bg)', color: 'var(--text)' }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Resumo</strong>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {metodo === 'pix'
              ? 'Pagamento via PIX com confirmacao imediata.'
              : `${parcelas}x de ${formatBRL(valorParcela)} no cartao.`}
          </span>
        </div>

        <button type="submit" className="btn btn-primary" disabled={processando}>
          {processando ? 'Confirmando...' : 'Confirmar compra'}
        </button>
      </form>
    </Modal>
  )
}
