import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarMeusCarros } from '../lib/api.js'
import { formatKm } from '../lib/format.js'
import Header from '../components/Header.jsx'
import styles from './MeusCarros.module.css'

export default function MeusCarros() {
  const [carros, setCarros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    listarMeusCarros()
      .then(setCarros)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.cabecalho}>
          <h1 className={styles.titulo}>Meus Carros</h1>
          <Link to="/carros/novo" className="btn btn-primary" style={{ width: 'auto' }}>
            Cadastrar veiculo
          </Link>
        </div>

        {carregando && <p className={styles.aviso}>Carregando...</p>}
        {erro && <div className="alert-error">{erro}</div>}
        {!carregando && !erro && carros.length === 0 && (
          <p className={styles.aviso}>Voce ainda nao cadastrou nenhum veiculo.</p>
        )}

        <div className={styles.lista}>
          {carros.map((c) => (
            <article key={c.chassi} className={`card ${styles.carro}`}>
              <div className={styles.foto}>
                {c.fotos[0] ? (
                  <img src={c.fotos[0]} alt={`${c.marca} ${c.modelo}`} />
                ) : (
                  <span className={styles.semFoto}>Sem foto</span>
                )}
              </div>

              <div className={styles.info}>
                <h2 className={styles.nome}>
                  {c.marca} {c.modelo}
                </h2>
                <p className={styles.specs}>
                  {c.ano} · {formatKm(c.km_rodados)} · {c.placa} · {c.cor}
                </p>
                <span className={c.tem_anuncio_ativo ? styles.badgeAtivo : styles.badge}>
                  {c.tem_anuncio_ativo ? 'Anuncio ativo' : 'Sem anuncio'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
