import { useEffect, useState } from 'react'
import { listarMinhasCompras } from '../lib/api.js'
import { formatBRL, formatData } from '../lib/format.js'
import Header from '../components/Header.jsx'
import styles from './MinhasCompras.module.css'

export default function MinhasCompras() {
  const [compras, setCompras] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    listarMinhasCompras()
      .then(setCompras)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.titulo}>Minhas Compras</h1>

        {carregando && <p className={styles.aviso}>Carregando...</p>}
        {erro && <div className="alert-error">{erro}</div>}
        {!carregando && !erro && compras.length === 0 && (
          <p className={styles.aviso}>Voce ainda nao comprou nenhum veiculo.</p>
        )}

        <div className={styles.lista}>
          {compras.map((c) => (
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
                {c.pagamentos.map((p) => (
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
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
