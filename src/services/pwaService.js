/**
 * PWA Service: Service Worker Registration, Install Prompts, and Connectivity State
 */

class PWAService {
  constructor() {
    this.deferredInstallPrompt = null
    this.installListeners = new Set()
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    this.onlineListeners = new Set()

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault()
        this.deferredInstallPrompt = e
        this.notifyInstallListeners(true)
      })

      window.addEventListener('appinstalled', () => {
        this.deferredInstallPrompt = null
        this.notifyInstallListeners(false)
        console.log('Patronus was installed on the device home screen! ✨')
      })

      window.addEventListener('online', () => {
        this.isOnline = true
        this.notifyOnlineListeners(true)
      })

      window.addEventListener('offline', () => {
        this.isOnline = false
        this.notifyOnlineListeners(false)
      })
    }
  }

  /**
   * Register the Service Worker in production/local environments
   */
  registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Patronus Service Worker registered successfully! ✨ Scope:', reg.scope)
        })
        .catch((err) => {
          console.warn('Service Worker registration skipped or failed:', err)
        })
    })
  }

  canInstall() {
    return Boolean(this.deferredInstallPrompt)
  }

  onInstallChange(callback) {
    this.installListeners.add(callback)
    callback(this.canInstall())
    return () => this.installListeners.delete(callback)
  }

  notifyInstallListeners(canInstall) {
    this.installListeners.forEach((cb) => {
      try {
        cb(canInstall)
      } catch (err) {
        console.error(err)
      }
    })
  }

  onOnlineChange(callback) {
    this.onlineListeners.add(callback)
    callback(this.isOnline)
    return () => this.onlineListeners.delete(callback)
  }

  notifyOnlineListeners(isOnline) {
    this.onlineListeners.forEach((cb) => {
      try {
        cb(isOnline)
      } catch (err) {
        console.error(err)
      }
    })
  }

  async promptInstall() {
    if (!this.deferredInstallPrompt) return false
    try {
      this.deferredInstallPrompt.prompt()
      const { outcome } = await this.deferredInstallPrompt.userChoice
      this.deferredInstallPrompt = null
      this.notifyInstallListeners(false)
      return outcome === 'accepted'
    } catch {
      return false
    }
  }
}

export const pwaService = new PWAService()
