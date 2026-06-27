import { useEffect, useState } from 'react'
import { listarAnuncios } from '../lib/api.js'
import Header from '../components/Header.jsx'
import AnuncioCard from '../components/AnuncioCard.jsx'
import styles from './Vitrine.module.css'

const FILTROS_VAZIOS = { marca: '', valor_min: '', valor_max: '' }

export default function Vitrine() {
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS)
  const [anuncios, setAnuncios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  // Roda na carga inicial e a cada busca aplicada (busca muda esse contador).
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    setCarregando(true)
    setErro('')
    listarAnuncios({
      marca: filtros.marca || undefined,
      valor_min: filtros.valor_min ? Number(filtros.valor_min) : undefined,
      valor_max: filtros.valor_max ? Number(filtros.valor_max) : undefined,
    })
      .then(setAnuncios)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao])

  function atualizar(campo) {
    return (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }))
  }

  function buscar(e) {
    e.preventDefault()
    setVersao((v) => v + 1)
  }

  function limpar() {
    setFiltros(FILTROS_VAZIOS)
    setVersao((v) => v + 1)
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.titulo}>Anuncios</h1>

        <form className={styles.filtros} onSubmit={buscar}>
          <input
            className="input"
            placeholder="Marca"
            value={filtros.marca}
            onChange={atualizar('marca')}
          />
          <input
            className="input"
            type="number"
            placeholder="Valor min"
            value={filtros.valor_min}
            onChange={atualizar('valor_min')}
          />
          <input
            className="input"
            type="number"
            placeholder="Valor max"
            value={filtros.valor_max}
            onChange={atualizar('valor_max')}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
            Buscar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'auto' }}
            onClick={limpar}
          >
            Limpar
          </button>
        </form>

        {carregando && <p className={styles.aviso}>Carregando...</p>}
        {erro && <div className="alert-error">{erro}</div>}
        {!carregando && !erro && anuncios.length === 0 && (
          <p className={styles.aviso}>Nenhum anuncio encontrado.</p>
        )}

        <div className={styles.grade}>
          {anuncios.map((a) => (
            <AnuncioCard key={a.id_anuncio} anuncio={a} />
          ))}
        </div>
      </main>
    </>
  )
}
