import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { pwaService } from './services/pwaService'
import './index.css'
import App from './App.jsx'

// Register PWA service worker
pwaService.registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

