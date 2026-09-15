import { INITIAL_MESSAGES } from '../data/mockData'

const STORAGE_KEY_MESSAGES = 'patronus_messages'

/**
 * Get all messages for a given circle
 */
export function getMessages(circleId) {
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

/**
 * Save messages array to storage
 */
function saveAllMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
  } catch (err) {
    console.error('Failed to save messages to storage:', err)
  }
}

/**
 * Cast a new Patronus message
 */
export function sendPatronus({ circleId, senderId, senderName, content, type = 'standard' }) {
  if (!content?.trim()) {
    throw new Error('Your Patronus cannot be empty.')
  }

  const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
  const allMessages = raw ? JSON.parse(raw) : [...INITIAL_MESSAGES]

  const newMsg = {
    id: `msg-${Date.now()}`,
    circleId,
    senderId,
    senderName,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    type
  }

  allMessages.push(newMsg)
  saveAllMessages(allMessages)

  return newMsg
}
