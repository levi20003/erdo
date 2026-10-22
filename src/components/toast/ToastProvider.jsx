import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { uid } from '../../lib/time'
import { useFocusLock } from '../../store/AppStore'
import Icon from '../ui/Icon'

const ToastContext = createContext(null)
const VISIBLE_MS = 4000
const EXIT_MS = 180

const TONES = {
  info: { icon: 'info', className: 'text-zinc-400' },
  success: { icon: 'sprout', className: 'text-olive-300' },
  danger: { icon: 'alert', className: 'text-[#d9a3a8]' },
}

/**
 * Distraction lock: while a focus block runs, toasts are queued but never
 * rendered (anything on screen disappears too). They appear once the block ends.
 */
export function ToastProvider({ children }) {
  const locked = useFocusLock()
  const [queue, setQueue] = useState([])

  const push = useCallback((message, tone = 'info') => setQueue((q) => [...q, { id: uid(), message, tone }]), [])
  const dismiss = useCallback((id) => setQueue((q) => q.filter((toast) => toast.id !== id)), [])
  const api = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {!locked && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {queue.slice(-3).map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

function Toast({ toast, onDismiss }) {
  const [leaving, setLeaving] = useState(false)
  const tone = TONES[toast.tone] ?? TONES.info

  // The timer starts only once the toast is actually on screen.
  useEffect(() => {
    const id = setTimeout(() => setLeaving(true), VISIBLE_MS)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!leaving) return
    const id = setTimeout(() => onDismiss(toast.id), EXIT_MS)
    return () => clearTimeout(id)
  }, [leaving, toast.id, onDismiss])

  return (
    <button
      type="button"
      onClick={() => setLeaving(true)}
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/95 px-4 py-3 text-left text-sm text-zinc-200 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md ${
        leaving ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <Icon name={tone.icon} size={16} className={tone.className} />
      <span className="min-w-0 flex-1">{toast.message}</span>
    </button>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
