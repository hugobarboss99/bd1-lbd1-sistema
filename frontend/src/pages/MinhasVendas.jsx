import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarMinhasVendas } from '../lib/api.js'
import { formatBRL, formatData } from '../lib/format.js'
import Header from '../components/Header.jsx'
import styles from './MinhasVendas.module.css'

export default function MinhasVendas() {
  const [vendas, setVendas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    listarMinhasVendas()
      .then(setVendas)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.titulo}>Minhas Vendas</h1>

        {carregando && <p className={styles.aviso}>Carregando...</p>}
        {erro && <div className="alert-error">{erro}</div>}
        {!carregando && !erro && vendas.length === 0 && (
          <p className={styles.aviso}>Voce ainda nao vendeu nenhum veiculo.</p>
        )}

        <div className={styles.lista}>
          {vendas.map((v) => (
            <article key={v.id_venda} className={`card ${styles.venda}`}>
              <div>
                <p className={styles.comprador}>
                  Vendido para <strong>{v.comprador.nome}</strong>
                </p>
                <p className={styles.meta}>
                  <Link to={`/anuncios/${v.id_anuncio}`} className={styles.link}>
                    Anuncio #{v.id_anuncio}
                  </Link>{' '}
                  · {formatData(v.data_venda)}
                </p>
              </div>
              <span className={styles.valor}>{formatBRL(v.valor)}</span>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
