import { useState, useEffect, useRef } from 'react'
import MessageBubble from '../components/messaging/MessageBubble'
import MessageComposer from '../components/messaging/MessageComposer'
import MemberList from '../components/circles/MemberList'
import PatronusButton from '../components/common/PatronusButton'
import { getMessages, sendPatronus } from '../services/messageService'
import './CircleDashboard.css'

export default function CircleDashboard({ circle, currentUser, onLeaveCircle }) {
  const [messages, setMessages] = useState(() => (circle ? getMessages(circle.id) : []))
  const [showMembers, setShowMembers] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  useEffect(() => {
    scrollToBottom(false)
  }, [circle])

  useEffect(() => {
    scrollToBottom(true)
  }, [messages])

  // Handle message casting
  const handleSendPatronus = (content) => {
    if (!content.trim() || !circle || !currentUser) return

    try {
      const newMsg = sendPatronus({
        circleId: circle.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content
      })
      setMessages((prev) => [...prev, newMsg])
    } catch (err) {
      console.error('Failed to cast message:', err)
    }
  }

  // Handle copy circle code
  const handleCopyCode = async () => {
    if (!circle?.code) return
    try {
      await navigator.clipboard.writeText(circle.code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // Fallback
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  return (
    <div className="circle-dashboard" id="circle-dashboard">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__inner">
          <div className="dashboard-header__left">
            <button
              type="button"
              className="dashboard-header__back-btn"
              onClick={onLeaveCircle}
              title="Return to Sanctuary"
              aria-label="Return to Sanctuary"
            >
              ←
            </button>

            <div className="dashboard-header__titles">
              <h1 className="dashboard-header__circle-name">{circle.name}</h1>
              {circle.description && (
                <span className="dashboard-header__desc">{circle.description}</span>
              )}
            </div>
          </div>

          <div className="dashboard-header__right">
            <button
              type="button"
              className="circle-code-pill"
              onClick={handleCopyCode}
              title="Click to copy invite code"
            >
              <span aria-hidden="true">🗝️</span>
              <span>{circle.code}</span>
              {copiedCode ? (
                <span className="circle-code-pill__copied">Copied! ✨</span>
              ) : (
                <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>📋</span>
              )}
            </button>

            <PatronusButton
              variant="secondary"
              size="sm"
              onClick={() => setShowMembers(!showMembers)}
              aria-expanded={showMembers}
            >
              <span>{circle.members?.length || 1} Members</span>
              <span aria-hidden="true">{showMembers ? '▴' : '▾'}</span>
            </PatronusButton>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Chat / Messaging Section */}
        <main className="chat-container">
          <div className="messages-scroll-area">
            {messages.length === 0 ? (
              <div className="messages-empty-state">
                <div className="messages-empty-state__icon" aria-hidden="true">🦉</div>
                <h2 className="messages-empty-state__title">No Patronuses have arrived yet</h2>
                <p className="messages-empty-state__text">
                  Your Circle is waiting for its first message. Cast a thought to break the silence!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.senderId === currentUser?.id}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Message Composer */}
          <MessageComposer onSendPatronus={handleSendPatronus} />
        </main>

        {/* Sidebar Members Roster */}
        <aside className={`dashboard-sidebar ${showMembers ? '' : 'dashboard-sidebar--collapsed'}`}>
          <MemberList
            members={circle.members || []}
            currentUserId={currentUser?.id}
          />
        </aside>
      </div>
    </div>
  )
}
