import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { uid } from '../../lib/time'
import { useFocusLock } from '../../store/AppStore'
import Icon from '../ui/Icon'

const ToastContext = createContext(null)
const VISIBLE_MS = 4000
const EXIT_MS = 180

const TONES = {
  info: { icon: 'info', className: 'bg-white/15 text-white' },
  success: { icon: 'check', className: 'bg-[#9bd486] text-[#1d3324]' },
  danger: { icon: 'alert', className: 'bg-[#e8a8a0] text-[#4a1f1f]' },
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
          className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
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
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-[#2e2222] py-2.5 pl-2.5 pr-4 text-left text-sm font-semibold text-[#f7f8e8] shadow-[0_16px_40px_-12px_rgb(0_0_0/0.6)] ring-1 ring-white/10 ${
        leaving ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-xl ${tone.className}`}>
        <Icon name={tone.icon} size={16} strokeWidth={2.2} />
      </span>
      <span className="min-w-0 flex-1 leading-snug">{toast.message}</span>
    </button>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
