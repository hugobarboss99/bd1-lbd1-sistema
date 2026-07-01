import { useEffect, useState } from 'react'
import { listarMinhasCompras } from '../lib/api.js'
import { formatBRL, formatData } from '../lib/format.js'
import Header from '../components/Header.jsx'
import RegistrarPagamentoModal from '../components/RegistrarPagamentoModal.jsx'
import styles from './MinhasCompras.module.css'

// Saldo pendente e so para exibicao/apoio ao usuario (sugere o valor da
// proxima parcela). Quem decide de fato se um pagamento e valido e o
// backend (trigger RN08 - trg_valida_soma_pagamento), que rejeita qualquer
// soma que exceda o valor da venda.
function saldoPendente(compra) {
  const pago = (compra.pagamentos ?? []).reduce((soma, p) => soma + p.valor, 0)
  return Math.max(0, compra.valor - pago)
}

export default function MinhasCompras() {
  const [compras, setCompras] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [pagando, setPagando] = useState(null) // id_venda em pagamento

  function carregar() {
    setCarregando(true)
    listarMinhasCompras()
      .then(setCompras)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  function aoPagar(mensagemSucesso) {
    setPagando(null)
    setMensagem(mensagemSucesso)
    carregar()
  }

  const compraEmPagamento = compras.find((c) => c.id_venda === pagando)

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.titulo}>Minhas Compras</h1>

        {mensagem && <div className="alert-success">{mensagem}</div>}
        {carregando && <p className={styles.aviso}>Carregando...</p>}
        {erro && <div className="alert-error">{erro}</div>}
        {!carregando && !erro && compras.length === 0 && (
          <p className={styles.aviso}>Voce ainda nao comprou nenhum veiculo.</p>
        )}

        <div className={styles.lista}>
          {compras.map((c) => {
            const saldo = saldoPendente(c)
            return (
              <article key={c.id_venda} className={`card ${styles.compra}`}>
                <div className={styles.cabecalho}>
                  <div>
                    <h2 className={styles.carro}>
                      {c.carro.marca} {c.carro.modelo}
                    </h2>
                    <p className={styles.meta}>
                      {c.carro.placa} · comprado em {formatData(c.data_venda)}
                    </p>
                  </div>
                  <span className={styles.valor}>{formatBRL(c.valor)}</span>
                </div>

                <ul className={styles.parcelas}>
                  {(c.pagamentos ?? []).map((p) => (
                    <li key={p.parcela} className={styles.parcela}>
                      <span>Parcela {p.parcela}</span>
                      <span>{formatBRL(p.valor)}</span>
                      <span
                        className={p.status_pagamento === 'PAGO' ? styles.pago : styles.pendente}
                      >
                        {p.status_pagamento}
                      </span>
                    </li>
                  ))}
                </ul>

                {saldo > 0 && (
                  <div className={styles.acoesPagamento}>
                    <span className={styles.saldoPendente}>
                      Saldo pendente: {formatBRL(saldo)}
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: 'auto' }}
                      onClick={() => setPagando(c.id_venda)}
                    >
                      Pagar parcela
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </main>

      {compraEmPagamento && (
        <RegistrarPagamentoModal
          idVenda={compraEmPagamento.id_venda}
          saldoPendente={saldoPendente(compraEmPagamento)}
          onFechar={() => setPagando(null)}
          onSucesso={aoPagar}
        />
      )}
    </>
  )
}