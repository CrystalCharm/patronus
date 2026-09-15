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

  return (
    <div
      className={`message-row ${isCurrentUser ? 'message-row--outgoing' : 'message-row--incoming'}`}
    >
      <div className="message-meta">
        <span className={`message-sender ${isCurrentUser ? 'message-sender--you' : ''}`}>
          {isCurrentUser ? 'You' : message.senderName}
        </span>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>

      <div
        className={`message-bubble ${isCurrentUser ? 'message-bubble--outgoing' : 'message-bubble--incoming'}`}
      >
        {isCurrentUser && (
          <span className="message-bubble__sparkle" aria-hidden="true">✨</span>
        )}
        <p>{message.content}</p>
      </div>
    </div>
  )
}
