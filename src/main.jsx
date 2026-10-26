import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import LanguageRoot from './components/LanguageRoot'
import { ToastProvider } from './components/toast/ToastProvider'
import { installGlobalErrorHandlers, logError } from './lib/errorLog'
import { AppStoreProvider } from './store/AppStore'
import './index.css'

installGlobalErrorHandlers()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppStoreProvider>
        <LanguageRoot>
          <ToastProvider>
            <App />
          </ToastProvider>
        </LanguageRoot>
      </AppStoreProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Registered in production only, so the dev server never serves stale cached files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err) => logError('sw', err, 'registration failed')),
  )
}
