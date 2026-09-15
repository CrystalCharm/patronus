import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import CircleDashboard from './pages/CircleDashboard'
import CreateCircleModal from './components/circles/CreateCircleModal'
import JoinCircleModal from './components/circles/JoinCircleModal'
import { getCircles } from './services/circleService'
import './App.css'

function App() {
  const [activeCircle, setActiveCircle] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  // Pre-seed and check storage on initial mount
  useEffect(() => {
    // Ensure circles are initialized in storage
    getCircles()
  }, [])

  const handleCircleCreated = (circle, user) => {
    setActiveCircle(circle)
    setCurrentUser(user)
  }

  const handleCircleJoined = (circle, user) => {
    setActiveCircle(circle)
    setCurrentUser(user)
  }

  const handleLeaveCircle = () => {
    setActiveCircle(null)
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
