import { useState, useRef } from 'react'
import PatronusButton from '../common/PatronusButton'
import './MessageComposer.css'

export default function MessageComposer({ onSendPatronus, disabled }) {
  const [content, setContent] = useState('')
  const [isCasting, setIsCasting] = useState(false)
  const inputRef = useRef(null)

  const handleCast = () => {
    if (!content.trim() || disabled || isCasting) return

    setIsCasting(true)
    onSendPatronus(content.trim())
    setContent('')

    setTimeout(() => {
      setIsCasting(false)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 450)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCast()
    }
  }

  return (
    <div className="message-composer-wrapper">
      <div className={`message-composer ${isCasting ? 'message-composer--casting' : ''}`}>
        <textarea
          ref={inputRef}
          className="message-composer__input"
          placeholder="Write a Patronus..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          aria-label="Write a Patronus"
        />

        <div className="message-composer__cast-btn">
          <PatronusButton
            variant="primary"
            size="sm"
            onClick={handleCast}
            disabled={!content.trim() || disabled || isCasting}
            aria-label="Cast Patronus"
          >
            <span>CAST</span>
            <span aria-hidden="true">✨</span>
          </PatronusButton>
        </div>
      </div>
    </div>
  )
}
