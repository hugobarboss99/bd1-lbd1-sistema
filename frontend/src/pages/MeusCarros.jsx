import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarMeusCarros } from '../lib/api.js'
import { formatKm, formatBRL, formatData } from '../lib/format.js'
import Header from '../components/Header.jsx'
import AdicionarFotoModal from '../components/AdicionarFotoModal.jsx'
import RegistrarManutencaoModal from '../components/RegistrarManutencaoModal.jsx'
import CriarAnuncioModal from '../components/CriarAnuncioModal.jsx'
import styles from './MeusCarros.module.css'

export default function MeusCarros() {
  const [carros, setCarros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [modal, setModal] = useState(null) // { tipo: 'foto' | 'manutencao', chassi }

  function carregar() {
    listarMeusCarros()
      .then(setCarros)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  function aoConcluir(msg) {
    setModal(null)
    setMensagem(msg)
    carregar()
  }

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

        {mensagem && <div className="alert-success">{mensagem}</div>}
        {carregando && <p className={styles.aviso}>Carregando...</p>}
        {erro && <div className="alert-error">{erro}</div>}
        {!carregando && !erro && carros.length === 0 && (
          <p className={styles.aviso}>Voce ainda nao cadastrou nenhum veiculo.</p>
        )}

        <div className={styles.lista}>
          {carros.map((c) => (
            <article key={c.chassi} className={`card ${styles.carro}`}>
              <div className={styles.foto}>
                {c.fotos?.[0] ? (
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

                {c.manutencoes?.length > 0 ? (
                  <details className={styles.manutencoes}>
                    <summary>
                      {c.manutencoes.length}{' '}
                      {c.manutencoes.length === 1 ? 'manutencao registrada' : 'manutencoes registradas'}
                    </summary>
                    <ul>
                      {c.manutencoes.map((m, i) => (
                        <li key={i}>
                          {formatData(m.data_manutencao)} · {m.descricao} · {formatBRL(m.custo)}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <p className={styles.semManutencao}>Nenhuma manutencao registrada.</p>
                )}
              </div>

              <div className={styles.acoes}>
                {!c.tem_anuncio_ativo && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setModal({ tipo: 'anuncio', chassi: c.chassi })}
                  >
                    Criar anuncio
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModal({ tipo: 'foto', chassi: c.chassi })}
                >
                  Adicionar foto
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModal({ tipo: 'manutencao', chassi: c.chassi })}
                >
                  Registrar manutencao
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {modal?.tipo === 'foto' && (
        <AdicionarFotoModal
          chassi={modal.chassi}
          onFechar={() => setModal(null)}
          onSucesso={aoConcluir}
        />
      )}
      {modal?.tipo === 'manutencao' && (
        <RegistrarManutencaoModal
          chassi={modal.chassi}
          onFechar={() => setModal(null)}
          onSucesso={aoConcluir}
        />
      )}
      {modal?.tipo === 'anuncio' && (
        <CriarAnuncioModal
          chassi={modal.chassi}
          onFechar={() => setModal(null)}
          onSucesso={aoConcluir}
        />
      )}
    </>
  )
}