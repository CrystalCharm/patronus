import { INITIAL_CIRCLES } from '../data/mockData'
import { supabase, isOnlineAvailable } from './supabaseClient'

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
 * Get cached/local circles
 */
export function getLocalCircles() {
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

function saveLocalCircles(circles) {
  try {
    localStorage.setItem(STORAGE_KEY_CIRCLES, JSON.stringify(circles))
  } catch (err) {
    console.error('Failed to save circles to storage:', err)
  }
}

/**
 * Retrieve a circle by its unique ID
 */
export async function getCircleById(id) {
  if (isOnlineAvailable()) {
    try {
      const { data: circleData, error: circleErr } = await supabase
        .from('circles')
        .select('*')
        .eq('id', id)
        .single()

      if (!circleErr && circleData) {
        const { data: memberData } = await supabase
          .from('circle_members')
          .select('*')
          .eq('circle_id', id)

        return {
          id: circleData.id,
          name: circleData.name,
          code: circleData.code,
          description: circleData.description,
          keeperId: circleData.keeper_id,
          keeperName: circleData.keeper_name,
          createdAt: circleData.created_at,
          members: (memberData || []).map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            patronus: m.patronus_form,
            online: true
          }))
        }
      }
    } catch (err) {
      console.warn('Supabase getCircleById error, falling back to local:', err)
    }
  }

  const circles = getLocalCircles()
  return circles.find(c => c.id === id) || null
}

/**
 * Find a circle by its invite code (case-insensitive)
 */
export async function getCircleByCode(code) {
  if (!code) return null
  const normalized = code.trim().toUpperCase()

  if (isOnlineAvailable()) {
    try {
      const { data: circleData, error: circleErr } = await supabase
        .from('circles')
        .select('*')
        .ilike('code', normalized)
        .maybeSingle()

      if (!circleErr && circleData) {
        const { data: memberData } = await supabase
          .from('circle_members')
          .select('*')
          .eq('circle_id', circleData.id)

        return {
          id: circleData.id,
          name: circleData.name,
          code: circleData.code,
          description: circleData.description,
          keeperId: circleData.keeper_id,
          keeperName: circleData.keeper_name,
          createdAt: circleData.created_at,
          members: (memberData || []).map(m => ({
            id: m.id,
            name: m.name,
            role: m.role,
            patronus: m.patronus_form,
            online: true
          }))
        }
      }
    } catch (err) {
      console.warn('Supabase getCircleByCode error, falling back to local:', err)
    }
  }

  const circles = getLocalCircles()
  return circles.find(c => c.code.toUpperCase() === normalized) || null
}

/**
 * Create a new Circle and assign the creator as the Circle Keeper
 */
export async function createCircle({ name, description = '', keeperName }) {
  if (!name?.trim()) throw new Error('Circle name is required.')
  if (!keeperName?.trim()) throw new Error('Your wizard name is required.')

  const newId = `circle-${Date.now()}`
  const keeperId = `wizard-${Date.now()}`
  const code = generateCircleCode()
  const cleanName = name.trim()
  const cleanKeeper = keeperName.trim()
  const cleanDesc = description.trim()
  const createdAt = new Date().toISOString()

  const newCircle = {
    id: newId,
    name: cleanName,
    code,
    description: cleanDesc,
    createdAt,
    keeperId,
    keeperName: cleanKeeper,
    members: [
      {
        id: keeperId,
        name: cleanKeeper,
        role: 'keeper',
        patronus: 'Silver Stag',
        online: true
      }
    ]
  }

  // If online backend is configured, write to Supabase
  if (isOnlineAvailable()) {
    try {
      const { error: insertCircleErr } = await supabase
        .from('circles')
        .insert({
          id: newId,
          name: cleanName,
          code,
          description: cleanDesc,
          keeper_id: keeperId,
          keeper_name: cleanKeeper,
          created_at: createdAt
        })

      if (insertCircleErr) throw insertCircleErr

      const { error: insertMemberErr } = await supabase
        .from('circle_members')
        .insert({
          id: keeperId,
          circle_id: newId,
          name: cleanKeeper,
          role: 'keeper',
          patronus_form: 'Silver Stag',
          created_at: createdAt
        })

      if (insertMemberErr) throw insertMemberErr
    } catch (err) {
      console.warn('Failed to save circle online, storing locally:', err)
    }
  }

  // Also cache locally
  const circles = getLocalCircles()
  circles.unshift(newCircle)
  saveLocalCircles(circles)

  return {
    circle: newCircle,
    currentUser: {
      id: keeperId,
      name: cleanKeeper,
      role: 'keeper'
    }
  }
}

/**
 * Join an existing Circle using a valid Circle Code
 */
export async function joinCircle({ code, wizardName }) {
  if (!code?.trim()) throw new Error('Please enter a Circle Code.')
  if (!wizardName?.trim()) throw new Error('Your wizard name is required.')

  const circle = await getCircleByCode(code)
  if (!circle) {
    throw new Error('We could not find a Circle with that code. Please verify the code and try again.')
  }

  const cleanName = wizardName.trim()
  const existingMember = circle.members?.find(
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

    if (isOnlineAvailable()) {
      try {
        await supabase
          .from('circle_members')
          .insert({
            id: newMemberId,
            circle_id: circle.id,
            name: cleanName,
            role: 'member',
            patronus_form: 'Silver Light'
          })
      } catch (err) {
        console.warn('Could not sync joined member online:', err)
      }
    }

    circle.members.push(user)
    const local = getLocalCircles()
    const idx = local.findIndex(c => c.id === circle.id)
    if (idx !== -1) {
      local[idx] = circle
      saveLocalCircles(local)
    }
  }

  return {
    circle,
    currentUser: user
  }
}

/**
 * Fetch all members of a circle
 */
export async function getCircleMembers(circleId) {
  if (isOnlineAvailable()) {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        return data.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role || 'member',
          patronus: m.patronus_form || 'Silver Light'
        }))
      }
    } catch (err) {
      console.warn('Failed to fetch members online:', err)
    }
  }

  const localCircles = getLocalCircles()
  const circle = localCircles.find(c => c.id === circleId)
  return circle?.members || []
}

/**
 * Subscribe to live member roster updates for a circle
 */
export function subscribeToCircleMembers(circleId, onMemberEvent) {
  if (!isOnlineAvailable() || !supabase) {
    return () => {}
  }

  const channelName = `circle-members-${circleId}-${Math.random().toString(36).slice(2, 6)}`
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'circle_members',
        filter: `circle_id=eq.${circleId}`
      },
      (payload) => {
        const raw = payload.new
        if (raw) {
          onMemberEvent({
            eventType: payload.eventType,
            member: {
              id: raw.id,
              name: raw.name,
              role: raw.role || 'member',
              patronus: raw.patronus_form || 'Silver Light'
            }
          })
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Update member's chosen Patronus animal form in Supabase and local cache
 */
export async function updateMemberPatronus(memberId, circleId, patronusForm) {
  if (isOnlineAvailable()) {
    try {
      const { error } = await supabase
        .from('circle_members')
        .update({ patronus_form: patronusForm })
        .eq('id', memberId)

      if (error) throw error
    } catch (err) {
      console.warn('Failed to update patronus in Supabase:', err)
    }
  }

  const local = getLocalCircles()
  const circle = local.find((c) => c.id === circleId)
  if (circle && circle.members) {
    const member = circle.members.find((m) => m.id === memberId)
    if (member) {
      member.patronus = patronusForm
      saveLocalCircles(local)
    }
  }
}


