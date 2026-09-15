/**
 * Pre-seeded mock data for Patronus demo
 */

export const INITIAL_CIRCLES = [
  {
    id: 'circle-marauders',
    name: 'The Marauders',
    code: 'PATR-7X2K',
    description: 'Solemnly swearing we are up to good magic.',
    createdAt: '2026-09-15T12:00:00Z',
    keeperId: 'wizard-harry',
    keeperName: 'Harry',
    members: [
      { id: 'wizard-harry', name: 'Harry', role: 'keeper', patronus: 'Stag', online: true },
      { id: 'wizard-hermione', name: 'Hermione', role: 'member', patronus: 'Otter', online: true },
      { id: 'wizard-ron', name: 'Ron', role: 'member', patronus: 'Terrier', online: false },
    ]
  },
  {
    id: 'circle-starlight',
    name: 'Starlight Sanctuary',
    code: 'PATR-LUM0',
    description: 'A cozy corner for quiet thoughts and evening tea.',
    createdAt: '2026-09-15T10:30:00Z',
    keeperId: 'wizard-luna',
    keeperName: 'Luna',
    members: [
      { id: 'wizard-luna', name: 'Luna', role: 'keeper', patronus: 'Hare', online: true },
    ]
  }
]

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    circleId: 'circle-marauders',
    senderId: 'wizard-hermione',
    senderName: 'Hermione',
    content: 'Are we still meeting at the clocktower at 7?',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'standard'
  },
  {
    id: 'msg-2',
    circleId: 'circle-marauders',
    senderId: 'wizard-harry',
    senderName: 'Harry',
    content: 'Of course! I have the parchment and notes ready.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'standard'
  },
  {
    id: 'msg-3',
    circleId: 'circle-marauders',
    senderId: 'wizard-ron',
    senderName: 'Ron',
    content: "Brilliant. I'll bring some cauldron cakes from the Great Hall 🍰",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    type: 'standard'
  }
]
