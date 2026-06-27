import { Link } from 'react-router-dom'
import { formatBRL, formatKm } from '../lib/format.js'
import styles from './AnuncioCard.module.css'

export default function AnuncioCard({ anuncio }) {
  const { carro, valor_anunciado, foto_capa, id_anuncio } = anuncio

  return (
    <Link to={`/anuncios/${id_anuncio}`} className={`card ${styles.card}`}>
      <div className={styles.foto}>
        {foto_capa ? (
          <img src={foto_capa} alt={`${carro.marca} ${carro.modelo}`} />
        ) : (
          <span className={styles.semFoto}>Sem foto</span>
        )}
      </div>

      <div className={styles.corpo}>
        <h3 className={styles.titulo}>
          {carro.marca} {carro.modelo}
        </h3>
        <p className={styles.specs}>
          {carro.ano} · {formatKm(carro.km_rodados)}
        </p>
        <p className={styles.valor}>{formatBRL(valor_anunciado)}</p>
      </div>
    </Link>
  )
}
