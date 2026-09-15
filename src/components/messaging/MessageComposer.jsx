import { useState, useRef } from 'react'
import PatronusButton from '../common/PatronusButton'
import { notificationService } from '../../services/notificationService'
import './MessageComposer.css'

const MESSAGE_TYPES = [
  { id: 'standard', label: 'Patronus', icon: '✨', placeholder: 'Write a Patronus...' },
  { id: 'howler', label: 'Howler', icon: '⚡', placeholder: 'Write an urgent Howler...' },
  { id: 'whisper', label: 'Whisper', icon: '🌙', placeholder: 'Whisper a subtle secret...' },
  { id: 'spell', label: 'Spell', icon: '🪄', placeholder: 'Cast an incantation...' },
]

export default function MessageComposer({ onSendPatronus, disabled }) {
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState('standard')
  const [isCasting, setIsCasting] = useState(false)
  const inputRef = useRef(null)

  const activeTypeMeta = MESSAGE_TYPES.find(t => t.id === selectedType) || MESSAGE_TYPES[0]

  const handleCast = async () => {
    if (!content.trim() || disabled || isCasting) return

    const trimmed = content.trim()
    setIsCasting(true)

    try {
      // Sensory feedback for casting
      notificationService.playMagicalChime(selectedType)
      notificationService.triggerVibration(selectedType)

      await onSendPatronus(trimmed, selectedType)
      setContent('')
    } catch (err) {
      console.error('Failed to cast message:', err)
    } finally {
      setIsCasting(false)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCast()
    }
  }

  return (
    <div className="message-composer-wrapper">
      {/* Magical Message Type Selector */}
      <div className="message-type-bar" role="radiogroup" aria-label="Select Patronus Type">
        {MESSAGE_TYPES.map((type) => {
          const isActive = selectedType === type.id
          return (
            <button
              key={type.id}
              type="button"
              className={`message-type-tab ${isActive ? `message-type-tab--active message-type-tab--${type.id}` : ''}`}
              onClick={() => {
                setSelectedType(type.id)
                inputRef.current?.focus()
              }}
              aria-checked={isActive}
              role="radio"
            >
              <span className="message-type-tab__icon">{type.icon}</span>
              <span className="message-type-tab__label">{type.label}</span>
            </button>
          )
        })}
      </div>

      <div className={`message-composer ${isCasting ? 'message-composer--casting' : ''} message-composer--${selectedType}`}>
        <textarea
          ref={inputRef}
          className="message-composer__input"
          placeholder={activeTypeMeta.placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          aria-label={activeTypeMeta.placeholder}
        />

        <div className="message-composer__cast-btn">
          <PatronusButton
            variant="primary"
            size="sm"
            onClick={handleCast}
            disabled={!content.trim() || disabled || isCasting}
            aria-label={`Cast ${activeTypeMeta.label}`}
          >
            <span>CAST</span>
            <span aria-hidden="true">{activeTypeMeta.icon}</span>
          </PatronusButton>
        </div>
      </div>
    </div>
  )
}

