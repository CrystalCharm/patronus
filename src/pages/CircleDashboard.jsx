import { useState, useEffect, useRef, useCallback } from 'react'
import MessageBubble from '../components/messaging/MessageBubble'
import MessageComposer from '../components/messaging/MessageComposer'
import MemberList from '../components/circles/MemberList'
import PatronusButton from '../components/common/PatronusButton'
import { getMessages, getRecentMessages, sendPatronus, subscribeToCircleMessages, subscribeToCirclePresence } from '../services/messageService'
import { getCircleMembers, subscribeToCircleMembers } from '../services/circleService'
import { isOnlineAvailable } from '../services/supabaseClient'
import { notificationService } from '../services/notificationService'
import { pwaService } from '../services/pwaService'
import SpellbookModal from '../components/settings/SpellbookModal'
import './CircleDashboard.css'

export default function CircleDashboard({ circle, currentUser, onLeaveCircle }) {
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState(circle?.members || [])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())
  const [permission, setPermission] = useState(() => notificationService.getPermission())
  const [activeAlert, setActiveAlert] = useState(null)
  const [canInstall, setCanInstall] = useState(() => pwaService.canInstall())
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const alertTimeoutRef = useRef(null)
  const currentUserRef = useRef(currentUser)
  const messagesRef = useRef(messages)
  const isOnline = isOnlineAvailable()

  // Keep refs synchronized with latest props and state
  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

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

  const circleId = circle?.id

  // Function to load/reload data from Supabase
  const loadCircleData = useCallback(async () => {
    if (!circleId) return
    setIsLoading(true)
    setLoadError('')
    try {
      const [initialMsgs, initialMembers] = await Promise.all([
        getMessages(circleId),
        getCircleMembers(circleId)
      ])
      setMessages(initialMsgs)
      if (initialMembers.length > 0) {
        setMembers(initialMembers)
      }
    } catch (err) {
      console.error('Failed to load circle data:', err)
      setLoadError(err.message || 'The Patronus could not be retrieved. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [circleId])

  // Load messages and members on mount or circle change
  useEffect(() => {
    loadCircleData()
  }, [loadCircleData])

  // Reconcile missed messages (e.g. after phone sleep, background tab, or brief network drop)
  const reconcileMessages = useCallback(async () => {
    if (!circleId || !isOnline) return
    const currentList = messagesRef.current
    const latestTimestamp = currentList.length > 0 ? currentList[currentList.length - 1].createdAt : null

    try {
      const recent = await getRecentMessages(circleId, latestTimestamp)
      if (recent && recent.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m.id))
          const trulyNew = recent.filter(m => !existingIds.has(m.id))
          if (trulyNew.length === 0) return prev

          // Trigger alerts for messages from others
          trulyNew.forEach(m => {
            if (m.senderId !== currentUserRef.current?.id) {
              notificationService.notifyIncomingPatronus(m)
              showPatronusAlert({
                title: m.type === 'howler' ? '⚡ HOWLER ALERT' : m.type === 'whisper' ? '🌙 WHISPER RECEIVED' : m.type === 'spell' ? '🪄 SPELL CAST' : '✨ PATRONUS ARRIVED',
                body: `${m.senderName}: "${m.content}"`,
                type: m.type || 'standard'
              })
            }
          })

          const merged = [...prev, ...trulyNew]
          return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        })
      }
    } catch (err) {
      console.warn('Patronus message reconciliation failed:', err)
    }
  }, [circleId, isOnline, showPatronusAlert])

  // Sync on tab visibility, window focus, and periodic heartbeat
  useEffect(() => {
    if (!circleId || !isOnline) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reconcileMessages()
      }
    }

    const handleFocus = () => {
      reconcileMessages()
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    // Gentle 20-second heartbeat to ensure zero dropped messages during active viewing
    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        reconcileMessages()
      }
    }, 20000)

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      clearInterval(syncInterval)
    }
  }, [circleId, isOnline, reconcileMessages])

  // Subscribe to real-time incoming Patronuses with stable dependencies
  useEffect(() => {
    if (!circle?.id || !isOnline) return

    const unsubscribe = subscribeToCircleMessages(circle.id, (newMsg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        const updated = [...prev, newMsg]
        return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      })

      // Sensory feedback & in-app alert for messages from others
      if (newMsg.senderId !== currentUserRef.current?.id) {
        notificationService.notifyIncomingPatronus(newMsg)
        showPatronusAlert({
          title: newMsg.type === 'howler' ? '⚡ HOWLER ALERT' : newMsg.type === 'whisper' ? '🌙 WHISPER RECEIVED' : newMsg.type === 'spell' ? '🪄 SPELL CAST' : '✨ PATRONUS ARRIVED',
          body: `${newMsg.senderName}: "${newMsg.content}"`,
          type: newMsg.type || 'standard'
        })
      }
    })

    return unsubscribe
  }, [circle?.id, isOnline, showPatronusAlert])

  // Subscribe to real-time member events (joins and profile updates)
  useEffect(() => {
    if (!circle?.id || !isOnline) return

    const unsubscribe = subscribeToCircleMembers(circle.id, ({ eventType, member }) => {
      if (eventType === 'UPDATE') {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, ...member } : m))
        )
      } else {
        setMembers((prev) => {
          if (prev.some((m) => m.id === member.id || m.name.toLowerCase() === member.name.toLowerCase())) {
            return prev.map((m) => (m.id === member.id ? { ...m, ...member } : m))
          }
          showPatronusAlert({
            title: '✨ NEW WIZARD ARRIVED',
            body: `${member.name} has entered the Circle`,
            type: 'standard'
          })
          return [...prev, member]
        })
      }
    })

    return unsubscribe
  }, [circle?.id, isOnline, showPatronusAlert])

  // Subscribe to presence tracking
  useEffect(() => {
    const user = currentUserRef.current
    if (!circleId || !user || !isOnline) return

    const unsubscribe = subscribeToCirclePresence(circleId, user, (activeIds) => {
      setOnlineUserIds(activeIds)
    })

    return unsubscribe
  }, [circleId, isOnline])

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
        const updated = [...prev, newMsg]
        return updated.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      })
    } catch (err) {
      console.error('Failed to cast message:', err)
      showPatronusAlert({
        title: '⚠️ DELIVERY FAILED',
        body: err.message || 'The Patronus could not be delivered. Please try again.',
        type: 'howler'
      })
      throw err
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

  const handleUpdateUserPatronus = (newPatronus) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === currentUser?.id ? { ...m, patronus: newPatronus } : m))
    )
  }

  // Enrich members with dynamic state and online presence
  const enrichedMembers = (members || []).map((m) => ({
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
              className="spellbook-trigger-btn"
              onClick={() => setIsSpellbookOpen(true)}
              title="Open Spellbook (Profile & Settings)"
              aria-label="Open Spellbook"
            >
              <span aria-hidden="true">📖</span>
              <span className="spellbook-trigger-btn__text">Spellbook</span>
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
                <div className="messages-empty-state__icon animate-float" aria-hidden="true">🦉</div>
                <h2 className="messages-empty-state__title">Receiving Owl Post...</h2>
                <p className="messages-empty-state__text">Fetching messages from the ether...</p>
              </div>
            ) : loadError ? (
              <div className="messages-empty-state">
                <div className="messages-empty-state__icon" aria-hidden="true">⚠️</div>
                <h2 className="messages-empty-state__title">The Owl Post was delayed</h2>
                <p className="messages-empty-state__text">{loadError}</p>
                <div style={{ marginTop: '1rem' }}>
                  <PatronusButton size="sm" variant="secondary" onClick={loadCircleData}>
                    Try Again ↺
                  </PatronusButton>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="messages-empty-state">
                <div className="messages-empty-state__icon" aria-hidden="true">🕊️</div>
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

      {/* Spellbook (Settings & Wizard Profile Modal) */}
      <SpellbookModal
        isOpen={isSpellbookOpen}
        onClose={() => setIsSpellbookOpen(false)}
        currentUser={currentUser}
        circle={circle}
        onLeaveCircle={onLeaveCircle}
        onUpdateUserPatronus={handleUpdateUserPatronus}
      />
    </div>
  )
}
