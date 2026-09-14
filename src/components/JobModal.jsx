import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { themes } from '../data.js'
import { CloseIcon, iconMap } from './icons.jsx'

export default function JobModal({ job, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  if (!job) return null

  const theme = themes[job.theme] ?? themes.default
  const Icon = iconMap[job.icon]
  const titleId = `job-modal-title-${job.id}`

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="job-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="job-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ borderColor: theme.primary }}
      >
        <button
          ref={closeButtonRef}
          className="job-modal__close"
          onClick={onClose}
          aria-label="Close job details"
        >
          <CloseIcon size={18} color="#191333" />
        </button>

        <div
          className="job-modal__banner"
          style={{ background: `linear-gradient(120deg, ${theme.primaryDark}, ${theme.primary} 65%)` }}
        >
          <div className="job-modal__company">
            {Icon && <Icon size={24} color="#ffffff" />}
            <span>{job.company}</span>
          </div>
          <h3 id={titleId} className="job-modal__role">
            {job.role}
          </h3>
          {job.current && (
            <span
              className="job-modal__tag"
              style={{ background: theme.accent, color: theme.primaryDark }}
            >
              CURRENT ROLE
            </span>
          )}
        </div>
        <div className="job-modal__stripe" style={{ background: theme.accent }} />

        <div className="job-modal__body">
          <p className="job-modal__meta">
            {[job.period, job.duration, job.location].filter(Boolean).join(' · ')}
          </p>
          {job.description && <p className="job-modal__description">{job.description}</p>}
          {job.bullets.length > 0 && (
            <ul className="job-modal__bullets">
              {job.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
