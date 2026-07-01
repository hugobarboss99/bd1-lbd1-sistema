import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { formatBRL, formatData } from '../lib/format.js'
import {
  listarUsuariosAdmin,
  atualizarStatusUsuario,
  excluirUsuario,
  listarAnunciosAdmin,
  removerAnuncioAdmin,
} from '../lib/api.js'
import styles from './AdminUsuarios.module.css'

// Esta tela consome os endpoints reais de admin (sem mock). O contrato
// (admin_router.py) nao expoe um campo "is_admin" na listagem de usuarios,
// entao nao ha como esconder previamente as acoes para contas admin: os
// botoes ficam disponiveis para todos os usuarios listados, e se a acao for
// invalida (ex: tentar bloquear outro admin) o backend e quem rejeita - o
// erro retornado e exibido normalmente no modal de confirmacao.
//
// Tambem nao existe o conceito de anuncio "irregular" com "motivo" no
// contrato: o endpoint GET /admin/anuncios retorna todos os anuncios da
// plataforma (ativos e encerrados), e a acao disponivel e so remover/encerrar.

const ABAS = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'anuncios', label: 'Todos os anuncios' },
]

export default function AdminUsuarios() {
  const [aba, setAba] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [anuncios, setAnuncios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [acao, setAcao] = useState(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    carregarTudo()
  }, [])

  async function carregarTudo() {
    setCarregando(true)
    setErroCarregamento('')
    try {
      const [listaUsuarios, listaAnuncios] = await Promise.all([
        listarUsuariosAdmin(),
        listarAnunciosAdmin(),
      ])
      setUsuarios(listaUsuarios)
      setAnuncios(listaAnuncios)
    } catch (e) {
      setErroCarregamento(e.message || 'Nao foi possivel carregar os dados administrativos.')
    } finally {
      setCarregando(false)
    }
  }

  const totalUsuarios = usuarios.length
  const bloqueados = usuarios.filter((usuario) => usuario.status_conta === 'BLOQUEADO').length
  const totalAnuncios = anuncios.length

  function abrirAcao(tipo, item) {
    setMensagem('')
    setErro('')
    setAcao({ tipo, item })
  }

  function cancelarAcao() {
    if (processando) return
    setAcao(null)
  }

  async function confirmarAcao() {
    if (!acao) return

    setProcessando(true)
    setErro('')

    try {
      if (acao.tipo === 'toggle-usuario') {
        const novoStatus = acao.item.status_conta === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO'
        await atualizarStatusUsuario(acao.item.cpf, novoStatus)
        setUsuarios((lista) =>
          lista.map((usuario) =>
            usuario.cpf === acao.item.cpf ? { ...usuario, status_conta: novoStatus } : usuario,
          ),
        )
        setMensagem(
          `Usuario ${acao.item.nome} ${novoStatus === 'BLOQUEADO' ? 'bloqueado' : 'reativado'} com sucesso.`,
        )
      }

      if (acao.tipo === 'excluir-usuario') {
        await excluirUsuario(acao.item.cpf)
        setUsuarios((lista) => lista.filter((usuario) => usuario.cpf !== acao.item.cpf))
        setMensagem(`Usuario ${acao.item.nome} excluido com sucesso.`)
      }

      if (acao.tipo === 'remover-anuncio') {
        await removerAnuncioAdmin(acao.item.id_anuncio)
        setAnuncios((lista) =>
          lista.map((anuncio) =>
            anuncio.id_anuncio === acao.item.id_anuncio
              ? { ...anuncio, status: 'ENCERRADO' }
              : anuncio,
          ),
        )
        setMensagem(`Anuncio #${acao.item.id_anuncio} removido com sucesso.`)
      }

      setAcao(null)
    } catch (e) {
      setErro(e.message || 'Nao foi possivel concluir a acao.')
    } finally {
      setProcessando(false)
    }
  }

  const tituloConfirmacao =
    acao?.tipo === 'toggle-usuario'
      ? acao.item.status_conta === 'ATIVO'
        ? 'Bloquear usuario'
        : 'Reativar usuario'
      : acao?.tipo === 'excluir-usuario'
        ? 'Excluir usuario'
        : 'Remover anuncio'

  const mensagemConfirmacao =
    acao?.tipo === 'toggle-usuario'
      ? acao.item.status_conta === 'ATIVO'
        ? `Deseja bloquear ${acao.item.nome}? O acesso sera suspenso ate reativacao.`
        : `Deseja reativar ${acao.item.nome}?`
      : acao?.tipo === 'excluir-usuario'
        ? `Deseja excluir ${acao.item.nome}? Esta acao nao pode ser desfeita.`
        : acao?.tipo === 'remover-anuncio'
          ? `Deseja remover o anuncio #${acao.item.id_anuncio}?`
          : ''

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.kicker}>Area restrita</p>
            <h1 className={styles.titulo}>Painel administrativo</h1>
            <p className={styles.subtitulo}>
              Gerencie usuarios e anuncios da plataforma sem sair da interface.
            </p>
          </div>

          <div className={styles.metricas}>
            <article className={`card ${styles.metica}`}>
              <span className={styles.metaLabel}>Usuarios</span>
              <strong className={styles.metaValue}>{totalUsuarios}</strong>
            </article>
            <article className={`card ${styles.metica}`}>
              <span className={styles.metaLabel}>Bloqueados</span>
              <strong className={styles.metaValue}>{bloqueados}</strong>
            </article>
            <article className={`card ${styles.metica}`}>
              <span className={styles.metaLabel}>Anuncios</span>
              <strong className={styles.metaValue}>{totalAnuncios}</strong>
            </article>
          </div>
        </section>

        {erroCarregamento && <div className="alert-error">{erroCarregamento}</div>}
        {mensagem && <div className="alert-success">{mensagem}</div>}
        {erro && <div className="alert-error">{erro}</div>}

        <div className={styles.abas} role="tablist" aria-label="Painel administrativo">
          {ABAS.map((abaItem) => (
            <button
              key={abaItem.id}
              type="button"
              role="tab"
              aria-selected={aba === abaItem.id}
              className={aba === abaItem.id ? styles.abaAtiva : styles.aba}
              onClick={() => setAba(abaItem.id)}
            >
              {abaItem.label}
            </button>
          ))}
        </div>

        {carregando ? (
          <p className={styles.meta}>Carregando...</p>
        ) : aba === 'usuarios' ? (
          <section className={styles.lista} aria-label="Lista de usuarios">
            {usuarios.map((usuario) => (
              <article key={usuario.cpf} className={`card ${styles.item}`}>
                <div className={styles.identificacao}>
                  <div className={styles.topoItem}>
                    <h2 className={styles.nome}>{usuario.nome}</h2>
                    <span
                      className={
                        usuario.status_conta === 'ATIVO' ? styles.badgeAtivo : styles.badgeBloqueado
                      }
                    >
                      {usuario.status_conta}
                    </span>
                  </div>
                  <p className={styles.meta}>
                    {usuario.login} · {usuario.cpf}
                  </p>
                  <p className={styles.meta}>Cadastrado em {formatData(usuario.data_cadastro)}</p>
                </div>

                <div className={styles.acoes}>
                  <button
                    type="button"
                    className={
                      usuario.status_conta === 'ATIVO' ? 'btn btn-secondary' : 'btn btn-primary'
                    }
                    style={{ width: 'auto' }}
                    onClick={() => abrirAcao('toggle-usuario', usuario)}
                  >
                    {usuario.status_conta === 'ATIVO' ? 'Bloquear usuario' : 'Reativar usuario'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: 'auto' }}
                    onClick={() => abrirAcao('excluir-usuario', usuario)}
                  >
                    Excluir usuario
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className={styles.lista} aria-label="Lista de anuncios">
            {anuncios.map((anuncio) => (
              <article key={anuncio.id_anuncio} className={`card ${styles.item}`}>
                <div className={styles.identificacao}>
                  <div className={styles.topoItem}>
                    <h2 className={styles.nome}>Anuncio #{anuncio.id_anuncio}</h2>
                    <span
                      className={
                        anuncio.status === 'ATIVO' ? styles.badgeAtivo : styles.badgeBloqueado
                      }
                    >
                      {anuncio.status}
                    </span>
                  </div>
                  <p className={styles.meta}>{formatBRL(anuncio.valor_anunciado)}</p>
                  <p className={styles.meta}>
                    Anunciante: {anuncio.anunciante.nome} · {anuncio.anunciante.cpf}
                  </p>
                </div>

                <div className={styles.acoes}>
                  {anuncio.status === 'ATIVO' && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ width: 'auto' }}
                      onClick={() => abrirAcao('remover-anuncio', anuncio)}
                    >
                      Remover anuncio
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {acao && (
        <ConfirmModal
          titulo={tituloConfirmacao}
          mensagem={mensagemConfirmacao}
          confirmarLabel={tituloConfirmacao}
          perigo={acao.tipo !== 'toggle-usuario' || acao.item.status_conta === 'ATIVO'}
          processando={processando}
          erro={erro}
          onConfirmar={confirmarAcao}
          onCancelar={cancelarAcao}
        />
      )}
    </>
  )
}