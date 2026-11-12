import { t } from '../../lib/strings'
import Icon from '../ui/Icon'

export const NAV_ITEMS = [
  { id: 'focus', icon: 'clock' },
  { id: 'forest', icon: 'tree' },
  { id: 'stats', icon: 'chart' },
  { id: 'settings', icon: 'settings' },
]

/** Phone: fixed tab bar at the bottom, within thumb reach, above the home indicator. */
export function BottomNav({ tab, onChange }) {
  return (
    <nav
      aria-label={t.nav.label}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800/80 bg-zinc-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {NAV_ITEMS.map(({ id, icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                  active ? 'text-sand-200' : 'text-zinc-500 active:text-zinc-300'
                }`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${active ? 'bg-olive/50' : ''}`}>
                  <Icon name={icon} size={19} strokeWidth={active ? 2 : 1.8} />
                </span>
                {t.nav[id]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Tablet and desktop: the same tabs as a segmented control in the header. */
export function HeaderNav({ tab, onChange }) {
  return (
    <nav aria-label={t.nav.label} className="hidden md:block">
      <ul className="flex gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1">
        {NAV_ITEMS.map(({ id, icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition ${
                  active ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <Icon name={icon} size={16} className={active ? 'text-sand' : ''} />
                {t.nav[id]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
