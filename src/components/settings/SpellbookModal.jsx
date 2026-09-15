import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import PatronusButton from '../common/PatronusButton'
import { notificationService } from '../../services/notificationService'
import { updateMemberPatronus } from '../../services/circleService'
import './SpellbookModal.css'

export const PATRONUS_FORMS = [
  { id: 'Silver Stag', label: 'Silver Stag', icon: '🦌', desc: 'Noble protector, beacon of hope' },
  { id: 'Silver Otter', label: 'Silver Otter', icon: '🦦', desc: 'Clever, playful and fiercely loyal' },
  { id: 'Golden Phoenix', label: 'Golden Phoenix', icon: '🦅', desc: 'Luminous fire and eternal rebirth' },
  { id: 'Dire Wolf', label: 'Dire Wolf', icon: '🐺', desc: 'Courageous guardian of the pack' },
  { id: 'Silver Cat', label: 'Silver Cat', icon: '🐈', desc: 'Graceful, perceptive and watchful' },
  { id: 'Celestial Swan', label: 'Celestial Swan', icon: '🦢', desc: 'Pure, steadfast and serene' },
  { id: 'Silver Hare', label: 'Silver Hare', icon: '🐇', desc: 'Swift spark of joy and light' },
  { id: 'Snowy Owl', label: 'Snowy Owl', icon: '🦉', desc: 'Ancient wisdom across the night sky' }
]

export default function SpellbookModal({
  isOpen,
  onClose,
  currentUser,
  circle,
  onLeaveCircle,
  onUpdateUserPatronus
}) {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'sensory' | 'circle'
  const [selectedPatronus, setSelectedPatronus] = useState(currentUser?.patronus || 'Silver Stag')
  const [isSavingPatronus, setIsSavingPatronus] = useState(false)

  // Sensory preferences
  const [soundEnabled, setSoundEnabled] = useState(notificationService.soundEnabled)
  const [hapticsEnabled, setHapticsEnabled] = useState(notificationService.hapticsEnabled)
  const [notifPermission, setNotifPermission] = useState(() => notificationService.getPermission())

  useEffect(() => {
    if (currentUser?.patronus) {
      setSelectedPatronus(currentUser.patronus)
    }
  }, [currentUser])

  useEffect(() => {
    return notificationService.onPrefsChange(({ sound, haptics }) => {
      setSoundEnabled(sound)
      setHapticsEnabled(haptics)
    })
  }, [])

  const handleSelectPatronus = async (formId) => {
    setSelectedPatronus(formId)
    if (!currentUser || !circle) return

    setIsSavingPatronus(true)
    try {
      await updateMemberPatronus(currentUser.id, circle.id, formId)
      if (onUpdateUserPatronus) {
        onUpdateUserPatronus(formId)
      }
      notificationService.playMagicalChime('spell')
    } catch (err) {
      console.error('Failed to update patronus:', err)
    } finally {
      setIsSavingPatronus(false)
    }
  }

  const handleToggleSound = () => {
    const next = !soundEnabled
    notificationService.setSoundEnabled(next)
    setSoundEnabled(next)
    if (next) {
      notificationService.playMagicalChime('standard', true)
    }
  }

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled
    notificationService.setHapticsEnabled(next)
    setHapticsEnabled(next)
    if (next) {
      notificationService.triggerVibration('standard', true)
    }
  }

  const handleRequestNotifications = async () => {
    const granted = await notificationService.requestPermission()
    setNotifPermission(granted ? 'granted' : 'denied')
    if (granted) {
      notificationService.playMagicalChime('spell')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Spellbook"
      subtitle="Wizard Profile & Magical Settings"
      icon="📖"
    >
      {/* Spellbook Tabs */}
      <div className="spellbook-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={`spellbook-tab ${activeTab === 'profile' ? 'spellbook-tab--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span aria-hidden="true">✨</span>
          <span>Wizard Profile</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sensory'}
          className={`spellbook-tab ${activeTab === 'sensory' ? 'spellbook-tab--active' : ''}`}
          onClick={() => setActiveTab('sensory')}
        >
          <span aria-hidden="true">🔮</span>
          <span>Sensory & Alerts</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'circle'}
          className={`spellbook-tab ${activeTab === 'circle' ? 'spellbook-tab--active' : ''}`}
          onClick={() => setActiveTab('circle')}
        >
          <span aria-hidden="true">🗝️</span>
          <span>Sanctuary</span>
        </button>
      </div>

      {/* Tab: Wizard Profile & Patronus Form */}
      {activeTab === 'profile' && (
        <div className="spellbook-section">
          <div className="wizard-profile-header">
            <div className="wizard-profile-avatar">
              {PATRONUS_FORMS.find((f) => f.id === selectedPatronus)?.icon || '✨'}
            </div>
            <div className="wizard-profile-meta">
              <h3 className="wizard-profile-name">{currentUser?.name || 'Wizard'}</h3>
              <span className="wizard-profile-role">
                {currentUser?.role === 'keeper' ? '🗝️ Circle Keeper' : '✨ Circle Member'}
              </span>
            </div>
          </div>

          <label className="spellbook-label">
            Choose Your Patronus Form {isSavingPatronus && <span className="spellbook-label-sync">Saving... ✨</span>}
          </label>
          <p className="spellbook-desc">
            Your Patronus represents your magical spirit inside the Circle.
          </p>

          <div className="patronus-grid">
            {PATRONUS_FORMS.map((form) => {
              const isSelected = selectedPatronus === form.id
              return (
                <button
                  key={form.id}
                  type="button"
                  className={`patronus-card ${isSelected ? 'patronus-card--selected' : ''}`}
                  onClick={() => handleSelectPatronus(form.id)}
                >
                  <span className="patronus-card__icon">{form.icon}</span>
                  <span className="patronus-card__label">{form.label}</span>
                  <span className="patronus-card__desc">{form.desc}</span>
                  {isSelected && <span className="patronus-card__active-dot">✦</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Sensory & Notification Preferences */}
      {activeTab === 'sensory' && (
        <div className="spellbook-section">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Ethereal Sound Chimes</span>
              <span className="setting-desc">Harmonic crystal tones synthesized on sending or receiving Patronuses.</span>
            </div>
            <div className="setting-actions">
              <button
                type="button"
                className="spellbook-mini-btn"
                onClick={() => notificationService.playMagicalChime('standard', true)}
                title="Preview sound chime"
              >
                Test 🔔
              </button>
              <button
                type="button"
                className={`spellbook-switch ${soundEnabled ? 'spellbook-switch--on' : ''}`}
                onClick={handleToggleSound}
                aria-label="Toggle Sound Chimes"
                role="switch"
                aria-checked={soundEnabled}
              >
                <span className="spellbook-switch__knob" />
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Haptic Vibrations</span>
              <span className="setting-desc">Tactile magical pulses for incoming Howlers, Whispers, and Spells.</span>
            </div>
            <div className="setting-actions">
              <button
                type="button"
                className="spellbook-mini-btn"
                onClick={() => notificationService.triggerVibration('howler', true)}
                title="Preview vibration pulse"
              >
                Test 📳
              </button>
              <button
                type="button"
                className={`spellbook-switch ${hapticsEnabled ? 'spellbook-switch--on' : ''}`}
                onClick={handleToggleHaptics}
                aria-label="Toggle Haptic Vibration"
                role="switch"
                aria-checked={hapticsEnabled}
              >
                <span className="spellbook-switch__knob" />
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">System Push Alerts</span>
              <span className="setting-desc">Receive browser alerts when Patronuses arrive while outside this tab.</span>
            </div>
            <div className="setting-actions">
              {notifPermission === 'granted' ? (
                <span className="status-badge status-badge--granted">Granted 🔔</span>
              ) : notifPermission === 'denied' ? (
                <span className="status-badge status-badge--denied">Blocked 🚫</span>
              ) : (
                <PatronusButton size="sm" variant="secondary" onClick={handleRequestNotifications}>
                  Enable Alerts
                </PatronusButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sanctuary / Circle Info */}
      {activeTab === 'circle' && (
        <div className="spellbook-section">
          <div className="circle-info-card">
            <div className="circle-info-row">
              <span className="circle-info-label">Circle Name:</span>
              <span className="circle-info-value">{circle?.name}</span>
            </div>
            <div className="circle-info-row">
              <span className="circle-info-label">Circle Code:</span>
              <span className="circle-info-value circle-info-code">{circle?.code}</span>
            </div>
            <div className="circle-info-row">
              <span className="circle-info-label">Circle Keeper:</span>
              <span className="circle-info-value">{circle?.keeperName || 'Keeper'}</span>
            </div>
            {circle?.description && (
              <div className="circle-info-row">
                <span className="circle-info-label">Description:</span>
                <span className="circle-info-value">{circle.description}</span>
              </div>
            )}
          </div>

          <div className="spellbook-leave-wrapper">
            <p className="spellbook-leave-hint">
              Stepping out of the Circle returns you to the Sanctuary landing page.
            </p>
            <PatronusButton
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose()
                if (onLeaveCircle) onLeaveCircle()
              }}
            >
              <span>Leave This Circle</span>
              <span aria-hidden="true">🚪</span>
            </PatronusButton>
          </div>
        </div>
      )}

      <div className="spellbook-footer">
        <PatronusButton variant="secondary" size="sm" onClick={onClose}>
          Close Spellbook
        </PatronusButton>
      </div>
    </Modal>
  )
}
