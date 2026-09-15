import { useState } from 'react'
import Modal from '../common/Modal'
import PatronusButton from '../common/PatronusButton'
import { joinCircle } from '../../services/circleService'
import './CircleForms.css'

export default function JoinCircleModal({ isOpen, onClose, onCircleJoined }) {
  const [code, setCode] = useState('')
  const [wizardName, setWizardName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter a Circle Code.')
      return
    }

    if (!wizardName.trim()) {
      setError('Please provide your Wizard Name.')
      return
    }

    try {
      setIsSubmitting(true)
      const { circle, currentUser } = joinCircle({
        code,
        wizardName
      })
      onCircleJoined(circle, currentUser)
      onClose()
      setCode('')
      setWizardName('')
    } catch (err) {
      setError(err.message || 'We could not join this Circle. Please check the code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillSampleCode = (sample) => {
    setCode(sample)
    setError('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join a Circle"
      subtitle="Enter an invitation code to enter a magical sanctuary"
      icon="🗝️"
    >
      <form className="circle-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="input-circle-code">
            Circle Code
          </label>
          <input
            id="input-circle-code"
            className="form-input form-input--code"
            type="text"
            placeholder="PATR-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={12}
            autoFocus
          />
          <span className="form-help">
            Have an invite code? Try demo circle:{' '}
            <button
              type="button"
              className="sample-code-hint"
              onClick={() => fillSampleCode('PATR-7X2K')}
            >
              PATR-7X2K
            </button>{' '}
            (The Marauders)
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="input-join-wizard-name">
            Your Wizard Name
          </label>
          <input
            id="input-join-wizard-name"
            className="form-input"
            type="text"
            placeholder="e.g. Padfoot, Hermione, Ron"
            value={wizardName}
            onChange={(e) => setWizardName(e.target.value)}
            maxLength={25}
          />
        </div>

        <div className="form-actions">
          <PatronusButton
            variant="ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </PatronusButton>

          <PatronusButton
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            icon={<span aria-hidden="true">✨</span>}
          >
            {isSubmitting ? 'Entering...' : 'Enter Circle'}
          </PatronusButton>
        </div>
      </form>
    </Modal>
  )
}
