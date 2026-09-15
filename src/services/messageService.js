import { INITIAL_MESSAGES } from '../data/mockData'
import { supabase, isOnlineAvailable } from './supabaseClient'

const STORAGE_KEY_MESSAGES = 'patronus_messages'

/**
 * Get all cached/local messages
 */
function getLocalMessages(circleId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
    let allMessages = raw ? JSON.parse(raw) : null
    if (!allMessages) {
      allMessages = INITIAL_MESSAGES
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(INITIAL_MESSAGES))
    }
    return allMessages
      .filter(m => m.circleId === circleId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } catch {
    return INITIAL_MESSAGES.filter(m => m.circleId === circleId)
  }
}

function saveLocalMessage(newMsg) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
    const all = raw ? JSON.parse(raw) : [...INITIAL_MESSAGES]
    if (!all.some(m => m.id === newMsg.id)) {
      all.push(newMsg)
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(all))
    }
  } catch (err) {
    console.error('Failed to save message locally:', err)
  }
}

/**
 * Get all messages for a given circle (live Supabase query with local fallback)
 */
export async function getMessages(circleId) {
  if (isOnlineAvailable()) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase getMessages error:', error)
      throw new Error(error.message || 'Could not retrieve Patronuses from the ether.')
    }

    return (data || []).map(m => ({
      id: m.id,
      circleId: m.circle_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      content: m.content,
      type: m.message_type || 'standard',
      createdAt: m.created_at
    }))
  }

  return getLocalMessages(circleId)
}

/**
 * Fetch recent messages created after a specific ISO timestamp (for missed event reconciliation)
 */
export async function getRecentMessages(circleId, afterTimestamp) {
  if (isOnlineAvailable()) {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: true })

    if (afterTimestamp) {
      query = query.gt('created_at', afterTimestamp)
    }

    const { data, error } = await query

    if (error) {
      console.warn('Supabase getRecentMessages error:', error)
      return []
    }

    return (data || []).map(m => ({
      id: m.id,
      circleId: m.circle_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      content: m.content,
      type: m.message_type || 'standard',
      createdAt: m.created_at
    }))
  }

  const local = getLocalMessages(circleId)
  if (!afterTimestamp) return local
  const afterDate = new Date(afterTimestamp).getTime()
  return local.filter(m => new Date(m.createdAt).getTime() > afterDate)
}

/**
 * Cast a new Patronus message and persist directly to Supabase
 */
export async function sendPatronus({ circleId, senderId, senderName, content, type = 'standard' }) {
  if (!content?.trim()) {
    throw new Error('Your Patronus cannot be empty.')
  }

  const cleanContent = content.trim()
  const newId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const createdAt = new Date().toISOString()

  // If online, insert and persist directly to Supabase
  if (isOnlineAvailable()) {
    const { error } = await supabase
      .from('messages')
      .insert({
        id: newId,
        circle_id: circleId,
        sender_id: senderId,
        sender_name: senderName,
        content: cleanContent,
        message_type: type,
        created_at: createdAt
      })

    if (error) {
      console.error('Failed to insert message into Supabase:', error)
      throw new Error(error.message || 'The Patronus could not be delivered. Please try again.')
    }

    const newMsg = {
      id: newId,
      circleId,
      senderId,
      senderName,
      content: cleanContent,
      type,
      createdAt
    }

    saveLocalMessage(newMsg)
    return newMsg
  }

  // Offline fallback
  const localMsg = {
    id: newId,
    circleId,
    senderId,
    senderName,
    content: cleanContent,
    type,
    createdAt
  }
  saveLocalMessage(localMsg)
  return localMsg
}

/**
 * Subscribe to live incoming Patronus messages for a circle in real time.
 * Uses instance-unique channel names, monitors connection states, and auto-retries on connection drops.
 */
export function subscribeToCircleMessages(circleId, onNewMessage, onStatusChange) {
  if (!isOnlineAvailable() || !supabase) {
    return () => {}
  }

  let activeChannel = null
  let isClosed = false
  let retryTimer = null
  let retryCount = 0

  function createSubscription() {
    if (isClosed || !supabase) return

    const channelName = `circle-messages-${circleId}-${Math.random().toString(36).slice(2, 7)}`
    activeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `circle_id=eq.${circleId}`
        },
        (payload) => {
          const raw = payload.new
          if (raw) {
            const formatted = {
              id: raw.id,
              circleId: raw.circle_id,
              senderId: raw.sender_id,
              senderName: raw.sender_name,
              content: raw.content,
              type: raw.message_type || 'standard',
              createdAt: raw.created_at
            }
            saveLocalMessage(formatted)
            onNewMessage(formatted)
          }
        }
      )
      .subscribe((status, err) => {
        if (onStatusChange) {
          onStatusChange(status)
        }

        if (status === 'SUBSCRIBED') {
          retryCount = 0
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.warn(`Patronus channel ${channelName} received ${status}. Attempting reconnection...`, err || '')
          if (!isClosed) {
            const delay = Math.min(1500 * Math.pow(1.5, retryCount), 12000)
            retryCount++
            clearTimeout(retryTimer)
            retryTimer = setTimeout(() => {
              if (activeChannel) {
                supabase.removeChannel(activeChannel)
                activeChannel = null
              }
              createSubscription()
            }, delay)
          }
        }
      })
  }

  createSubscription()

  return () => {
    isClosed = true
    clearTimeout(retryTimer)
    if (activeChannel) {
      supabase.removeChannel(activeChannel)
      activeChannel = null
    }
  }
}

/**
 * Track member live presence in a Circle
 */
export function subscribeToCirclePresence(circleId, user, onPresenceChange) {
  if (!isOnlineAvailable() || !supabase || !user) {
    return () => {}
  }

  const channelName = `circle-presence-${circleId}`
  const channel = supabase.channel(channelName)

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const activeUserIds = new Set()
      Object.values(state).forEach(presences => {
        presences.forEach(p => {
          if (p.userId) activeUserIds.add(p.userId)
        })
      })
      onPresenceChange(activeUserIds)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId: user.id,
          userName: user.name,
          onlineAt: new Date().toISOString()
        })
      }
    })

  return () => {
    supabase.removeChannel(channel)
  }
}
