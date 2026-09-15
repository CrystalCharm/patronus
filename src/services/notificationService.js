/**
 * Patronus Notification & Sensory Feedback Service
 * Handles audio chimes (Web Audio API), haptic vibration, and system notifications.
 */

class NotificationService {
  constructor() {
    this.audioCtx = null
  }

  /**
   * Check if browser Notification API is available
   */
  isNotificationSupported() {
    return typeof window !== 'undefined' && 'Notification' in window
  }

  /**
   * Check if device vibration is supported
   */
  isVibrationSupported() {
    return typeof window !== 'undefined' && 'vibrate' in navigator
  }

  /**
   * Current browser notification permission ('granted', 'denied', 'default', 'unsupported')
   */
  getPermission() {
    if (!this.isNotificationSupported()) return 'unsupported'
    return Notification.permission
  }

  /**
   * Request system notification permission
   */
  async requestPermission() {
    if (!this.isNotificationSupported()) return false
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch {
      return false
    }
  }

  /**
   * Lazy-initialize Web Audio Context for ethereal sounds
   */
  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass()
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {})
    }
    return this.audioCtx
  }

  /**
   * Synthesize a magical audio chime without requiring external sound files
   */
  playMagicalChime(type = 'standard') {
    try {
      const ctx = this.getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime

      if (type === 'howler') {
        // Urgent, reverberating chime
        const freqs = [330, 440, 660]
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(freq, now + i * 0.05)
          gain.gain.setValueAtTime(0.12, now + i * 0.05)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.1)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + i * 0.05)
          osc.stop(now + 0.7 + i * 0.1)
        })
      } else if (type === 'whisper') {
        // Soft, ambient ethereal chime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.4)
        gain.gain.setValueAtTime(0.06, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.85)
      } else if (type === 'spell') {
        // Shimmering celestial arpeggio (C6, E6, G6, B6)
        const notes = [1046.5, 1318.5, 1567.98, 1975.53]
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, now + index * 0.08)
          gain.gain.setValueAtTime(0.1, now + index * 0.08)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + index * 0.08)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + index * 0.08)
          osc.stop(now + 0.7 + index * 0.08)
        })
      } else {
        // Standard Patronus chime: crystal bell chord (E5 -> B5 -> E6)
        const chord = [659.25, 987.77, 1318.51]
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, now + idx * 0.04)
          gain.gain.setValueAtTime(0.08, now + idx * 0.04)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7 + idx * 0.05)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now + idx * 0.04)
          osc.stop(now + 0.8 + idx * 0.05)
        })
      }
    } catch {
      // Audio playback fails gracefully if unpermitted by browser autoplay policy
    }
  }

  /**
   * Device haptic vibration patterns with graceful fallback
   */
  triggerVibration(type = 'standard') {
    if (!this.isVibrationSupported()) return

    try {
      if (type === 'howler') {
        // Double intense vibration
        navigator.vibrate([160, 80, 160])
      } else if (type === 'whisper') {
        // Subtle short pulse
        navigator.vibrate([60])
      } else if (type === 'spell') {
        // Shimmering pattern
        navigator.vibrate([70, 40, 70, 40, 110])
      } else {
        // Normal single pulse
        navigator.vibrate([100])
      }
    } catch {
      // Vibration fail-safe
    }
  }

  /**
   * Send a Patronus Alert (sound + haptics + system notification)
   */
  notifyIncomingPatronus({ senderName, content, type = 'standard' }) {
    // 1. Sensory feedback
    this.playMagicalChime(type)
    this.triggerVibration(type)

    // 2. System notification (when document not in foreground or permitted)
    if (this.isNotificationSupported() && Notification.permission === 'granted') {
      try {
        const typeLabels = {
          howler: '⚡ HOWLER ALERT',
          whisper: '🌙 WHISPER RECEIVED',
          spell: '✨ SPELL CAST',
          standard: '✨ PATRONUS ALERT'
        }

        const title = typeLabels[type] || '✨ PATRONUS ALERT'
        const options = {
          body: `${senderName}: "${content.slice(0, 100)}${content.length > 100 ? '...' : ''}"`,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `patronus-${Date.now()}`
        }

        new Notification(title, options)
      } catch {
        // Silent fallback for restricted environments
      }
    }
  }
}

export const notificationService = new NotificationService()
