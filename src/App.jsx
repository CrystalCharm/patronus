import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import CircleDashboard from './pages/CircleDashboard'
import CreateCircleModal from './components/circles/CreateCircleModal'
import JoinCircleModal from './components/circles/JoinCircleModal'
import { getLocalCircles } from './services/circleService'
import './App.css'

// Ensure mock circles are seeded in localStorage on first load
getLocalCircles()

// Session storage key to keep user inside their active Circle across browser refreshes
const STORAGE_KEY_SESSION = 'patronus_active_session'

function getSavedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION)
    if (!raw) return { circle: null, user: null }
    return JSON.parse(raw)
  } catch {
    return { circle: null, user: null }
  }
}

function saveSession(circle, user) {
  try {
    if (circle && user) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ circle, user }))
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION)
    }
  } catch (err) {
    console.warn('Failed to save active session:', err)
  }
}

function App() {
  const initialSession = getSavedSession()
  const [activeCircle, setActiveCircle] = useState(initialSession.circle)
  const [currentUser, setCurrentUser] = useState(initialSession.user)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  const handleCircleCreated = (circle, user) => {
    setActiveCircle(circle)
    setCurrentUser(user)
    saveSession(circle, user)
  }

  const handleCircleJoined = (circle, user) => {
    setActiveCircle(circle)
    setCurrentUser(user)
    saveSession(circle, user)
  }

  const handleLeaveCircle = () => {
    setActiveCircle(null)
    setCurrentUser(null)
    saveSession(null, null)
  }

  return (
    <div className="patronus-app">
      {activeCircle ? (
        <CircleDashboard
          key={activeCircle.id}
          circle={activeCircle}
          currentUser={currentUser}
          onLeaveCircle={handleLeaveCircle}
        />
      ) : (
        <LandingPage
          onCreateCircle={() => setIsCreateModalOpen(true)}
          onJoinCircle={() => setIsJoinModalOpen(true)}
        />
      )}

      {/* Modals */}
      <CreateCircleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCircleCreated={handleCircleCreated}
      />

      <JoinCircleModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onCircleJoined={handleCircleJoined}
      />
    </div>
  )
}

export default App
