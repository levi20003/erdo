import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import LanguageRoot from './components/LanguageRoot'
import ThemeRoot from './components/ThemeRoot'
import { ToastProvider } from './components/toast/ToastProvider'
import { installGlobalErrorHandlers } from './lib/errorLog'
import { registerServiceWorker } from './lib/updates'
import { AppStoreProvider } from './store/AppStore'
import './index.css'

installGlobalErrorHandlers()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppStoreProvider>
        <ThemeRoot>
          <LanguageRoot>
            <ToastProvider>
              <App />
            </ToastProvider>
          </LanguageRoot>
        </ThemeRoot>
      </AppStoreProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

// Registered in production only, so the dev server never serves stale cached files.
if (import.meta.env.PROD) registerServiceWorker(`${import.meta.env.BASE_URL}sw.js`)
