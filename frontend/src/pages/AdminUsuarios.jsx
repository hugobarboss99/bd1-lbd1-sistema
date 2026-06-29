import { useState } from 'react'
import Header from '../components/Header.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { formatBRL, formatData } from '../lib/format.js'
import { ANUNCIOS_IRREGULARES_ADMIN, USUARIOS_ADMIN } from '../lib/mockData.js'
import styles from './AdminUsuarios.module.css'

const ABAS = [
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'anuncios', label: 'Anuncios irregulares' },
]

function copiarUsuarios() {
  return USUARIOS_ADMIN.map((usuario) => ({ ...usuario }))
}

function copiarAnuncios() {
  return ANUNCIOS_IRREGULARES_ADMIN.map((anuncio) => ({
    ...anuncio,
    anunciante: { ...anuncio.anunciante },
    carro: { ...anuncio.carro },
  }))
}

function dormir(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function AdminUsuarios() {
  const [aba, setAba] = useState('usuarios')
  const [usuarios, setUsuarios] = useState(copiarUsuarios)
  const [anuncios, setAnuncios] = useState(copiarAnuncios)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [acao, setAcao] = useState(null)
  const [processando, setProcessando] = useState(false)

  const totalUsuarios = usuarios.length
  const bloqueados = usuarios.filter((usuario) => usuario.status === 'BLOQUEADO').length
  const irregulares = anuncios.length

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
      await dormir(250)

      if (acao.tipo === 'toggle-usuario') {
        setUsuarios((lista) =>
          lista.map((usuario) =>
            usuario.cpf === acao.item.cpf
              ? {
                  ...usuario,
                  status: usuario.status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO',
                  motivo_bloqueio:
                    usuario.status === 'ATIVO' ? 'Bloqueado pelo administrador.' : undefined,
                }
              : usuario,
          ),
        )
        setMensagem(
          `Usuario ${acao.item.nome} ${acao.item.status === 'ATIVO' ? 'bloqueado' : 'reativado'} com sucesso.`,
        )
      }

      if (acao.tipo === 'excluir-usuario') {
        setUsuarios((lista) => lista.filter((usuario) => usuario.cpf !== acao.item.cpf))
        setMensagem(`Usuario ${acao.item.nome} excluido com sucesso.`)
      }

      if (acao.tipo === 'remover-anuncio') {
        setAnuncios((lista) => lista.filter((anuncio) => anuncio.id_anuncio !== acao.item.id_anuncio))
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
      ? acao.item.status === 'ATIVO'
        ? 'Bloquear usuario'
        : 'Reativar usuario'
      : acao?.tipo === 'excluir-usuario'
        ? 'Excluir usuario'
        : 'Remover anuncio'

  const mensagemConfirmacao =
    acao?.tipo === 'toggle-usuario'
      ? acao.item.status === 'ATIVO'
        ? `Deseja bloquear ${acao.item.nome}? O acesso sera suspenso ate reativacao.`
        : `Deseja reativar ${acao.item.nome}?`
      : acao?.tipo === 'excluir-usuario'
        ? `Deseja excluir ${acao.item.nome}? Esta acao nao pode ser desfeita.`
        : acao?.tipo === 'remover-anuncio'
          ? `Deseja remover o anuncio #${acao.item.id_anuncio} de ${acao.item.carro.marca} ${acao.item.carro.modelo}?`
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
              Gerencie usuarios e trate anuncios irregulares sem sair da interface.
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
              <span className={styles.metaLabel}>Anuncios irregulares</span>
              <strong className={styles.metaValue}>{irregulares}</strong>
            </article>
          </div>
        </section>

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

        {aba === 'usuarios' ? (
          <section className={styles.lista} aria-label="Lista de usuarios">
            {usuarios.map((usuario) => (
              <article key={usuario.cpf} className={`card ${styles.item}`}>
                <div className={styles.identificacao}>
                  <div className={styles.topoItem}>
                    <h2 className={styles.nome}>{usuario.nome}</h2>
                    <span
                      className={
                        usuario.status === 'ATIVO' ? styles.badgeAtivo : styles.badgeBloqueado
                      }
                    >
                      {usuario.status}
                    </span>
                  </div>
                  <p className={styles.meta}>
                    {usuario.login} · {usuario.cpf}
                  </p>
                  <p className={styles.meta}>
                    {usuario.telefone} · Criado em {formatData(usuario.criado_em)}
                  </p>
                  {usuario.is_admin && <p className={styles.aviso}>Conta administrativa protegida.</p>}
                  {usuario.motivo_bloqueio && (
                    <p className={styles.aviso}>Motivo: {usuario.motivo_bloqueio}</p>
                  )}
                </div>

                <div className={styles.acoes}>
                  {!usuario.is_admin && (
                    <button
                      type="button"
                      className={
                        usuario.status === 'ATIVO' ? 'btn btn-secondary' : 'btn btn-primary'
                      }
                      style={{ width: 'auto' }}
                      onClick={() => abrirAcao('toggle-usuario', usuario)}
                    >
                      {usuario.status === 'ATIVO' ? 'Bloquear usuario' : 'Reativar usuario'}
                    </button>
                  )}
                  {!usuario.is_admin && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ width: 'auto' }}
                      onClick={() => abrirAcao('excluir-usuario', usuario)}
                    >
                      Excluir usuario
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className={styles.lista} aria-label="Lista de anuncios irregulares">
            {anuncios.map((anuncio) => (
              <article key={anuncio.id_anuncio} className={`card ${styles.item}`}>
                <div className={styles.identificacao}>
                  <div className={styles.topoItem}>
                    <h2 className={styles.nome}>
                      {anuncio.carro.marca} {anuncio.carro.modelo}
                    </h2>
                    <span className={styles.badgeIrregular}>{anuncio.status}</span>
                  </div>
                  <p className={styles.meta}>
                    #{anuncio.id_anuncio} · {formatBRL(anuncio.valor_anunciado)} · {formatData(anuncio.data_publicacao)}
                  </p>
                  <p className={styles.meta}>
                    {anuncio.carro.ano} · {anuncio.carro.placa} · {anuncio.carro.cor} ·{' '}
                    {anuncio.carro.km_rodados.toLocaleString('pt-BR')} km
                  </p>
                  <p className={styles.meta}>
                    Anunciante: {anuncio.anunciante.nome} · {anuncio.anunciante.cpf}
                  </p>
                  <p className={styles.aviso}>Motivo: {anuncio.motivo}</p>
                </div>

                <div className={styles.acoes}>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ width: 'auto' }}
                    onClick={() => abrirAcao('remover-anuncio', anuncio)}
                  >
                    Remover anuncio
                  </button>
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
          perigo={acao.tipo !== 'toggle-usuario' || acao.item.status === 'ATIVO'}
          processando={processando}
          erro={erro}
          onConfirmar={confirmarAcao}
          onCancelar={cancelarAcao}
        />
      )}
    </>
  )
}
