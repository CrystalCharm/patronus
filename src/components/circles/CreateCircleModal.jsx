import { useState } from 'react'
import Modal from '../common/Modal'
import PatronusButton from '../common/PatronusButton'
import { createCircle } from '../../services/circleService'
import './CircleForms.css'

export default function CreateCircleModal({ isOpen, onClose, onCircleCreated }) {
  const [circleName, setCircleName] = useState('')
  const [keeperName, setKeeperName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!circleName.trim()) {
      setError('Please give your Circle a name.')
      return
    }

    if (!keeperName.trim()) {
      setError('Please provide your Wizard Name.')
      return
    }

    try {
      setIsSubmitting(true)
      const { circle, currentUser } = createCircle({
        name: circleName,
        keeperName,
        description
      })
      onCircleCreated(circle, currentUser)
      onClose()
      // reset
      setCircleName('')
      setKeeperName('')
      setDescription('')
    } catch (err) {
      setError(err.message || 'An enchanted glitch occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create a Circle"
      subtitle="Found a new private sanctuary for you and your chosen ones"
      icon="✨"
    >
      <form className="circle-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="input-circle-name">
            Circle Name
          </label>
          <input
            id="input-circle-name"
            className="form-input"
            type="text"
            placeholder="e.g. The Marauders, Starlight Sanctuary"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
            maxLength={40}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="input-keeper-name">
            Your Wizard Name
          </label>
          <input
            id="input-keeper-name"
            className="form-input"
            type="text"
            placeholder="e.g. Harry, Luna, Padfoot"
            value={keeperName}
            onChange={(e) => setKeeperName(e.target.value)}
            maxLength={25}
          />
          <span className="form-help">
            You will become the Circle Keeper of this sanctuary.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="input-circle-desc">
            <span>Description</span>
            <span className="form-label__optional">Optional</span>
          </label>
          <textarea
            id="input-circle-desc"
            className="form-textarea"
            rows={2}
            placeholder="A short note or motto for your Circle..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={120}
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
            icon={<span aria-hidden="true">🪄</span>}
          >
            {isSubmitting ? 'Weaving Magic...' : 'Enchant Circle'}
          </PatronusButton>
        </div>
      </form>
    </Modal>
  )
}
