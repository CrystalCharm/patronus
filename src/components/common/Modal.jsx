import { useEffect } from 'react'
import './Modal.css'

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  ariaLabel
}) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header__title-group">
            <h2 className="modal-header__title">
              {icon && <span aria-hidden="true">{icon}</span>}
              <span>{title}</span>
            </h2>
            {subtitle && <p className="modal-header__subtitle">{subtitle}</p>}
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}
