import { INITIAL_CIRCLES } from '../data/mockData'

const STORAGE_KEY_CIRCLES = 'patronus_circles'

/**
 * Generate a magical Circle Code in format PATR-XXXX
 */
export function generateCircleCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `PATR-${result}`
}

/**
 * Get all available circles
 */
export function getCircles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CIRCLES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CIRCLES, JSON.stringify(INITIAL_CIRCLES))
      return INITIAL_CIRCLES
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_CIRCLES
  }
}

/**
 * Save circles to localStorage
 */
function saveCircles(circles) {
  try {
    localStorage.setItem(STORAGE_KEY_CIRCLES, JSON.stringify(circles))
  } catch (err) {
    console.error('Failed to save circles to storage:', err)
  }
}

/**
 * Retrieve a circle by its unique ID
 */
export function getCircleById(id) {
  const circles = getCircles()
  return circles.find(c => c.id === id) || null
}

/**
 * Find a circle by its invite code (case-insensitive)
 */
export function getCircleByCode(code) {
  if (!code) return null
  const normalized = code.trim().toUpperCase()
  const circles = getCircles()
  return circles.find(c => c.code.toUpperCase() === normalized) || null
}

/**
 * Create a new Circle and assign the creator as the Circle Keeper
 */
export function createCircle({ name, description = '', keeperName }) {
  if (!name?.trim()) throw new Error('Circle name is required.')
  if (!keeperName?.trim()) throw new Error('Your wizard name is required.')

  const circles = getCircles()
  const newId = `circle-${Date.now()}`
  const keeperId = `wizard-${Date.now()}`

  const newCircle = {
    id: newId,
    name: name.trim(),
    code: generateCircleCode(),
    description: description.trim(),
    createdAt: new Date().toISOString(),
    keeperId,
    keeperName: keeperName.trim(),
    members: [
      {
        id: keeperId,
        name: keeperName.trim(),
        role: 'keeper',
        patronus: 'Silver Stag',
        online: true
      }
    ]
  }

  circles.unshift(newCircle)
  saveCircles(circles)

  return {
    circle: newCircle,
    currentUser: {
      id: keeperId,
      name: keeperName.trim(),
      role: 'keeper'
    }
  }
}

/**
 * Join an existing Circle using a valid Circle Code
 */
export function joinCircle({ code, wizardName }) {
  if (!code?.trim()) throw new Error('Please enter a Circle Code.')
  if (!wizardName?.trim()) throw new Error('Your wizard name is required.')

  const circle = getCircleByCode(code)
  if (!circle) {
    throw new Error('We could not find a Circle with that code. Please verify the code and try again.')
  }

  const cleanName = wizardName.trim()
  const circles = getCircles()
  const targetIndex = circles.findIndex(c => c.id === circle.id)

  if (targetIndex === -1) {
    throw new Error('Circle could not be located.')
  }

  const existingMember = circles[targetIndex].members.find(
    m => m.name.toLowerCase() === cleanName.toLowerCase()
  )

  let user
  if (existingMember) {
    user = existingMember
  } else {
    const newMemberId = `wizard-${Date.now()}`
    user = {
      id: newMemberId,
      name: cleanName,
      role: 'member',
      patronus: 'Silver Light',
      online: true
    }
    circles[targetIndex].members.push(user)
    saveCircles(circles)
  }

  return {
    circle: circles[targetIndex],
    currentUser: user
  }
}
