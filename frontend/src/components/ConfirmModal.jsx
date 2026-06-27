import Modal from './Modal.jsx'

export default function ConfirmModal({
  titulo,
  mensagem,
  confirmarLabel = 'Confirmar',
  perigo = false,
  processando = false,
  erro = '',
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal titulo={titulo} onFechar={onCancelar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {erro && <div className="alert-error">{erro}</div>}
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{mensagem}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancelar}
            disabled={processando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={perigo ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirmar}
            disabled={processando}
          >
            {processando ? 'Aguarde...' : confirmarLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
