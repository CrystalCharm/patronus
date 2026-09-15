import './MessageBubble.css'

export default function MessageBubble({ message, isCurrentUser }) {
  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const type = message.type || 'standard'

  const getTypeBadge = () => {
    switch (type) {
      case 'howler':
        return <span className="message-type-badge message-type-badge--howler">⚡ Howler</span>
      case 'whisper':
        return <span className="message-type-badge message-type-badge--whisper">🌙 Whisper</span>
      case 'spell':
        return <span className="message-type-badge message-type-badge--spell">✨ Spell</span>
      default:
        return null
    }
  }

  const getSparkleIcon = () => {
    switch (type) {
      case 'howler':
        return '🔥'
      case 'whisper':
        return '🌙'
      case 'spell':
        return '🪄'
      default:
        return '✨'
    }
  }

  return (
    <div
      className={`message-row ${isCurrentUser ? 'message-row--outgoing' : 'message-row--incoming'} message-row--${type}`}
    >
      <div className="message-meta">
        <span className={`message-sender ${isCurrentUser ? 'message-sender--you' : ''}`}>
          {isCurrentUser ? 'You' : message.senderName}
        </span>
        {getTypeBadge()}
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>

      <div
        className={`message-bubble ${isCurrentUser ? 'message-bubble--outgoing' : 'message-bubble--incoming'} message-bubble--${type}`}
      >
        {isCurrentUser && (
          <span className="message-bubble__sparkle" aria-hidden="true">
            {getSparkleIcon()}
          </span>
        )}
        <p className={`message-content message-content--${type}`}>{message.content}</p>
      </div>
    </div>
  )
}
