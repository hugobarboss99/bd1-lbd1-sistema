import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { obterAnuncio, removerAnuncio } from '../lib/api.js'
import { getSession } from '../lib/auth.js'
import { formatBRL, formatKm, formatData } from '../lib/format.js'
import Header from '../components/Header.jsx'
import EditarAnuncioModal from '../components/EditarAnuncioModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import styles from './AnuncioDetalhe.module.css'

export default function AnuncioDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const sessao = getSession()

  const [anuncio, setAnuncio] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [editando, setEditando] = useState(false)
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false)
  const [removendo, setRemovendo] = useState(false)
  const [erroRemocao, setErroRemocao] = useState('')

  useEffect(() => {
    setCarregando(true)
    obterAnuncio(id)
      .then(setAnuncio)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [id])

  // So o dono nao compra o proprio anuncio (RN04); a checagem final e do backend.
  const ehDono = sessao?.cpf === anuncio?.anunciante.cpf

  function comprar() {
    if (!sessao) {
      navigate('/login')
      return
    }
    navigate(`/anuncios/${id}/comprar`)
  }

  function aoEditar(novoValor) {
    setAnuncio((a) => ({ ...a, valor_anunciado: novoValor }))
    setEditando(false)
  }

  async function remover() {
    setErroRemocao('')
    setRemovendo(true)
    try {
      await removerAnuncio(id)
      navigate('/carros/meus')
    } catch (e) {
      setErroRemocao(e.message)
      setRemovendo(false)
    }
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        {carregando && <p className={styles.aviso}>Carregando...</p>}
        {erro && <div className="alert-error">{erro}</div>}

        {anuncio && (
          <div className={styles.layout}>
            <div className={styles.foto}>
              {anuncio.carro.fotos[0] ? (
                <img
                  src={anuncio.carro.fotos[0]}
                  alt={`${anuncio.carro.marca} ${anuncio.carro.modelo}`}
                />
              ) : (
                <span className={styles.semFoto}>Sem foto</span>
              )}
            </div>

            <aside className={styles.painel}>
              <h1 className={styles.titulo}>
                {anuncio.carro.marca} {anuncio.carro.modelo}
              </h1>
              <p className={styles.subtitulo}>
                {anuncio.carro.ano} · {formatKm(anuncio.carro.km_rodados)}
              </p>

              <p className={styles.preco}>{formatBRL(anuncio.valor_anunciado)}</p>

              <dl className={styles.specs}>
                <Spec rotulo="Chassi" valor={anuncio.carro.chassi} />
                <Spec rotulo="Placa" valor={anuncio.carro.placa} />
                <Spec rotulo="Cor" valor={anuncio.carro.cor} />
                <Spec rotulo="Anunciante" valor={anuncio.anunciante.nome} />
                <Spec rotulo="Publicado em" valor={formatData(anuncio.data_publicacao)} />
              </dl>

              {ehDono ? (
                <div className={styles.acoesDono}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditando(true)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setConfirmandoRemocao(true)}
                  >
                    Remover anuncio
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-primary" onClick={comprar}>
                  Comprar
                </button>
              )}
            </aside>

            {anuncio.manutencoes?.length > 0 && (
              <section className={styles.manutencoes}>
                <h2 className={styles.secaoTitulo}>Historico de manutencoes</h2>
                <ul className={styles.listaManutencao}>
                  {anuncio.manutencoes.map((m, i) => (
                    <li key={i} className={styles.manutencao}>
                      <span>{m.descricao}</span>
                      <span className={styles.manutencaoMeta}>
                        {formatData(m.data_manutencao)} · {formatBRL(m.custo)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>

      {editando && (
        <EditarAnuncioModal
          id={id}
          valorAtual={anuncio.valor_anunciado}
          onFechar={() => setEditando(false)}
          onSucesso={aoEditar}
        />
      )}
      {confirmandoRemocao && (
        <ConfirmModal
          titulo="Remover anuncio"
          mensagem="Tem certeza que deseja remover este anuncio? Esta acao nao pode ser desfeita."
          confirmarLabel="Remover"
          perigo
          processando={removendo}
          erro={erroRemocao}
          onConfirmar={remover}
          onCancelar={() => setConfirmandoRemocao(false)}
        />
      )}
    </>
  )
}

function Spec({ rotulo, valor }) {
  return (
    <div className={styles.spec}>
      <dt>{rotulo}</dt>
      <dd>{valor}</dd>
    </div>
  )
}
