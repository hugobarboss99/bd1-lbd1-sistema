import styles from './Modal.module.css'

export default function Modal({ titulo, onFechar, children }) {
  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cabecalho}>
          <h2 className={styles.titulo}>{titulo}</h2>
          <button type="button" className={styles.fechar} onClick={onFechar}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
