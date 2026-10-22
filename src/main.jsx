import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastProvider } from './components/toast/ToastProvider'
import { AppStoreProvider } from './store/AppStore'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppStoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AppStoreProvider>
  </React.StrictMode>,
)

// Registered in production only, so the dev server never serves stale cached files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
