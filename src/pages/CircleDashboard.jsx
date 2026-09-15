import { useState, useEffect, useRef, useCallback } from 'react'
import MessageBubble from '../components/messaging/MessageBubble'
import MessageComposer from '../components/messaging/MessageComposer'
import MemberList from '../components/circles/MemberList'
import PatronusButton from '../components/common/PatronusButton'
import { getMessages, sendPatronus, subscribeToCircleMessages, subscribeToCirclePresence } from '../services/messageService'
import { getCircleMembers, subscribeToCircleMembers } from '../services/circleService'
import { isOnlineAvailable } from '../services/supabaseClient'
import { notificationService } from '../services/notificationService'
import { pwaService } from '../services/pwaService'
import './CircleDashboard.css'

export default function CircleDashboard({ circle, currentUser, onLeaveCircle }) {
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState(circle?.members || [])
  const [isLoading, setIsLoading] = useState(true)
  const [showMembers, setShowMembers] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const [permission, setPermission] = useState(() => notificationService.getPermission())
  const [activeAlert, setActiveAlert] = useState(null)
  const [canInstall, setCanInstall] = useState(() => pwaService.canInstall())
  const messagesEndRef = useRef(null)
  const alertTimeoutRef = useRef(null)
  const isOnline = isOnlineAvailable()

  // In-app floating toast alert
  const showPatronusAlert = useCallback((alertData) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current)
    setActiveAlert(alertData)
    alertTimeoutRef.current = setTimeout(() => {
      setActiveAlert(null)
    }, 4500)
  }, [])

  // Listen for PWA installability
  useEffect(() => {
    return pwaService.onInstallChange((installable) => {
      setCanInstall(installable)
    })
  }, [])

  // Load messages and members on mount
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      if (!circle) return
      try {
        const [initialMsgs, initialMembers] = await Promise.all([
          getMessages(circle.id),
          getCircleMembers(circle.id)
        ])
        if (!cancelled) {
          setMessages(initialMsgs)
          if (initialMembers.length > 0) {
            setMembers(initialMembers)
          }
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load circle data:', err)
        if (!cancelled) setIsLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [circle])

  // Subscribe to real-time incoming Patronuses
  useEffect(() => {
    if (!circle || !isOnline) return

    const unsubscribe = subscribeToCircleMessages(circle.id, (newMsg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      // Sensory feedback & in-app alert for messages from others
      if (newMsg.senderId !== currentUser?.id) {
        notificationService.notifyIncomingPatronus(newMsg)
        showPatronusAlert({
          title: newMsg.type === 'howler' ? '⚡ HOWLER ALERT' : newMsg.type === 'whisper' ? '🌙 WHISPER RECEIVED' : newMsg.type === 'spell' ? '🪄 SPELL CAST' : '✨ PATRONUS ARRIVED',
          body: `${newMsg.senderName}: "${newMsg.content}"`,
          type: newMsg.type || 'standard'
        })
      }
    })

    return unsubscribe
  }, [circle, isOnline, currentUser, showPatronusAlert])

  // Subscribe to real-time new members joining
  useEffect(() => {
    if (!circle || !isOnline) return

    const unsubscribe = subscribeToCircleMembers(circle.id, (newMember) => {
      setMembers((prev) => {
        if (prev.some(m => m.id === newMember.id || m.name.toLowerCase() === newMember.name.toLowerCase())) {
          return prev
        }
        showPatronusAlert({
          title: '✨ NEW WIZARD ARRIVED',
          body: `${newMember.name} has entered the Circle`,
          type: 'standard'
        })
        return [...prev, newMember]
      })
    })

    return unsubscribe
  }, [circle, isOnline, showPatronusAlert])

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
  const handleSendPatronus = async (content, type = 'standard') => {
    if (!content.trim() || !circle || !currentUser) return

    try {
      const newMsg = await sendPatronus({
        circleId: circle.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
        type
      })
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    } catch (err) {
      console.error('Failed to cast message:', err)
    }
  }

  // Handle requesting notification permissions
  const handleToggleNotifications = async () => {
    if (permission !== 'granted') {
      const granted = await notificationService.requestPermission()
      setPermission(granted ? 'granted' : 'denied')
      if (granted) {
        notificationService.playMagicalChime('standard')
      }
    } else {
      // Test chime when already enabled
      notificationService.playMagicalChime('spell')
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

  // Enrich members with dynamic state and online presence
  const enrichedMembers = (members || []).map(m => ({
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

            {canInstall && (
              <button
                type="button"
                className="pwa-install-pill"
                onClick={() => pwaService.promptInstall()}
                title="Install Patronus to Home Screen"
              >
                <span aria-hidden="true">📲</span>
                <span>Install</span>
              </button>
            )}

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

            <button
              type="button"
              className={`notification-toggle-btn ${permission === 'granted' ? 'notification-toggle-btn--active' : ''}`}
              onClick={handleToggleNotifications}
              title={
                permission === 'granted'
                  ? 'Patronus Alerts active (click to chime)'
                  : 'Enable Patronus Alert notifications'
              }
              aria-label="Patronus Alerts"
            >
              <span aria-hidden="true">{permission === 'granted' ? '🔔' : '🔕'}</span>
              <span className="notification-toggle-btn__text">
                {permission === 'granted' ? 'Alerts On' : 'Alerts'}
              </span>
            </button>

            <PatronusButton
              variant="secondary"
              size="sm"
              onClick={() => setShowMembers(!showMembers)}
              aria-expanded={showMembers}
            >
              <span>{members.length || 1} Members</span>
              <span aria-hidden="true">{showMembers ? '▴' : '▾'}</span>
            </PatronusButton>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Chat / Messaging Section */}
        <main className="chat-container">
          {/* Floating In-App Patronus Alert Banner */}
          {activeAlert && (
            <div
              className={`patronus-alert-banner patronus-alert-banner--${activeAlert.type || 'standard'}`}
              onClick={() => {
                setActiveAlert(null)
                scrollToBottom(true)
              }}
              role="alert"
            >
              <div className="patronus-alert-banner__content">
                <span className="patronus-alert-banner__title">{activeAlert.title}</span>
                <span className="patronus-alert-banner__body">{activeAlert.body}</span>
              </div>
              <button
                type="button"
                className="patronus-alert-banner__close"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveAlert(null)
                }}
                aria-label="Dismiss alert"
              >
                ✕
              </button>
            </div>
          )}

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
