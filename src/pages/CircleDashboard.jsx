import { useState, useEffect, useRef, useCallback } from 'react'
import MessageBubble from '../components/messaging/MessageBubble'
import MessageComposer from '../components/messaging/MessageComposer'
import MemberList from '../components/circles/MemberList'
import PatronusButton from '../components/common/PatronusButton'
import { getMessages, sendPatronus, subscribeToCircleMessages, subscribeToCirclePresence } from '../services/messageService'
import { isOnlineAvailable } from '../services/supabaseClient'
import './CircleDashboard.css'

export default function CircleDashboard({ circle, currentUser, onLeaveCircle }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMembers, setShowMembers] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const messagesEndRef = useRef(null)
  const isOnline = isOnlineAvailable()

  // Load messages on mount (async-compatible)
  useEffect(() => {
    let cancelled = false

    async function loadMessages() {
      if (!circle) return
      try {
        const initial = await getMessages(circle.id)
        if (!cancelled) {
          setMessages(initial)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load messages:', err)
        if (!cancelled) setIsLoading(false)
      }
    }

    loadMessages()
    return () => { cancelled = true }
  }, [circle])

  // Subscribe to real-time incoming Patronuses
  useEffect(() => {
    if (!circle || !isOnline) return

    const unsubscribe = subscribeToCircleMessages(circle.id, (newMsg) => {
      setMessages((prev) => {
        // Prevent duplicates (from own send or double delivery)
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    })

    return unsubscribe
  }, [circle, isOnline])

  // Subscribe to presence tracking
  useEffect(() => {
    if (!circle || !currentUser || !isOnline) return

    const unsubscribe = subscribeToCirclePresence(circle.id, currentUser, (activeIds) => {
      setOnlineUserIds(activeIds)
    })

    return unsubscribe
  }, [circle, currentUser, isOnline])

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto'
    })
  }, [])

  useEffect(() => {
    if (!isLoading) scrollToBottom(false)
  }, [isLoading, scrollToBottom])

  useEffect(() => {
    if (!isLoading) scrollToBottom(true)
  }, [messages, isLoading, scrollToBottom])

  // Handle message casting
  const handleSendPatronus = async (content) => {
    if (!content.trim() || !circle || !currentUser) return

    try {
      const newMsg = await sendPatronus({
        circleId: circle.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content
      })
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
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

  // Enrich members with online presence
  const enrichedMembers = (circle.members || []).map(m => ({
    ...m,
    online: onlineUserIds.has(m.id) || m.id === currentUser?.id
  }))

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
            {/* Connection Status Indicator */}
            <span className="connection-status" title={isOnline ? 'Connected to the Ether' : 'Local Parchment Mode'}>
              {isOnline ? (
                <><span className="connection-dot connection-dot--online"></span> Live</>
              ) : (
                <><span className="connection-dot connection-dot--offline"></span> Local</>
              )}
            </span>

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
            {isLoading ? (
              <div className="messages-empty-state">
                <div className="messages-empty-state__icon" aria-hidden="true">✨</div>
                <h2 className="messages-empty-state__title">Summoning your Circle...</h2>
              </div>
            ) : messages.length === 0 ? (
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
          <MessageComposer onSendPatronus={handleSendPatronus} disabled={isLoading} />
        </main>

        {/* Sidebar Members Roster */}
        <aside className={`dashboard-sidebar ${showMembers ? '' : 'dashboard-sidebar--collapsed'}`}>
          <MemberList
            members={enrichedMembers}
            currentUserId={currentUser?.id}
          />
        </aside>
      </div>
    </div>
  )
}
