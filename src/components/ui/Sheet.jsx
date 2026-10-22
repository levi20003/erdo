import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { t } from '../../lib/strings'
import Icon from './Icon'

const EXIT_MS = 200

/**
 * Bottom sheet on phones, centred dialog from `sm` up. Rendered in-page (not a
 * native window), so opening it never blurs the window or trips Strict Mode.
 */
export default function Sheet({ open, onClose, title, description, children }) {
  const [mounted, setMounted] = useState(open)
  const panelRef = useRef(null)
  // Parents re-render every timer tick; a ref keeps the focus effect from re-running.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const closing = mounted && !open

  useEffect(() => {
    if (open) setMounted(true)
    else if (mounted) {
      const id = setTimeout(() => setMounted(false), EXIT_MS)
      return () => clearTimeout(id)
    }
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Focus the first field, or the panel itself.
    requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector('[data-autofocus], input, button:not([data-close])') ?? panelRef.current
      target?.focus()
    })
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-b-0 border-zinc-800 bg-zinc-900 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl outline-none sm:max-w-md sm:rounded-2xl sm:border-b sm:p-6 ${
          closing ? 'animate-sheet-down sm:animate-pop-out' : 'animate-sheet-up sm:animate-pop-in'
        }`}
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700 sm:hidden" />
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
            {description && <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{description}</p>}
          </div>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label={t.close}
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Icon name="close" size={16} />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** Two-button confirmation, styled for the dark theme. Safe action is first and focused. */
export function ConfirmSheet({ open, onClose, onConfirm, title, description, confirmLabel, cancelLabel = t.cancel }) {
  return (
    <Sheet open={open} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-medium text-[#e2b8bc] transition hover:border-[#a8747a]/50 hover:bg-[#a8747a]/10 sm:py-2.5"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="rounded-xl bg-olive px-4 py-3 text-sm font-medium text-sand-100 transition hover:bg-olive-400 sm:py-2.5"
        >
          {cancelLabel}
        </button>
      </div>
    </Sheet>
  )
}

/** Keeps the last non-null value so sheet content stays put during the exit animation. */
export function useRetained(value) {
  const ref = useRef(value)
  if (value != null) ref.current = value
  return ref.current
}
