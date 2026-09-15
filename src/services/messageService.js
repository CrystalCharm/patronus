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
 * Get all messages for a given circle (hybrid online/offline)
 */
export async function getMessages(circleId) {
  if (isOnlineAvailable()) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        return data.map(m => ({
          id: m.id,
          circleId: m.circle_id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          content: m.content,
          type: m.message_type || 'standard',
          createdAt: m.created_at
        }))
      }
    } catch (err) {
      console.warn('Could not fetch messages from Supabase, using local fallback:', err)
    }
  }

  return getLocalMessages(circleId)
}

/**
 * Cast a new Patronus message
 */
export async function sendPatronus({ circleId, senderId, senderName, content, type = 'standard' }) {
  if (!content?.trim()) {
    throw new Error('Your Patronus cannot be empty.')
  }

  const cleanContent = content.trim()
  const newId = `msg-${Date.now()}`
  const createdAt = new Date().toISOString()

  const newMsg = {
    id: newId,
    circleId,
    senderId,
    senderName,
    content: cleanContent,
    type,
    createdAt
  }

  // If online, broadcast to Supabase
  if (isOnlineAvailable()) {
    try {
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
        console.warn('Failed to insert message into Supabase:', error)
      }
    } catch (err) {
      console.warn('Online cast failed, saving locally:', err)
    }
  }

  // Always cache locally
  saveLocalMessage(newMsg)

  return newMsg
}

/**
 * Subscribe to live incoming Patronus messages for a circle in real time
 */
export function subscribeToCircleMessages(circleId, onNewMessage) {
  if (!isOnlineAvailable() || !supabase) {
    return () => {}
  }

  const channelName = `circle-messages-${circleId}`
  const channel = supabase
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
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
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
