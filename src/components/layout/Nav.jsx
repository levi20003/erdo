import { haptic } from '../../lib/haptics'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'

export const NAV_ITEMS = [
  { id: 'focus', icon: 'home' },
  { id: 'forest', icon: 'tree' },
  { id: 'stats', icon: 'chart' },
  { id: 'settings', icon: 'user' },
]

/**
 * Phone: a bark-brown dock floating above the bottom edge.
 *
 * It floats (instead of being glued to the edge) so it sits well on every phone:
 * it clears rounded display corners, it stays above the Android gesture bar or
 * the iPhone home indicator (safe-area inset), and what is under it is always
 * the page colour — the same colour the system paints its own bottom strip
 * with — so nothing looks stacked. Content fades out behind it.
 */
export function BottomNav({ tab, onChange }) {
  const vibrate = useAppStore().state.prefs.sound.vibrate
  const index = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === tab))
  return (
    <nav aria-label={t.nav.label} className="pointer-events-none fixed inset-x-0 bottom-0 z-30 md:hidden">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[calc(7.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-zinc-950 from-30% to-transparent" />
      <div className="relative px-3 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
        <div className="pointer-events-auto relative mx-auto max-w-md rounded-[1.75rem] bg-[linear-gradient(180deg,rgb(var(--tab-from)),rgb(var(--tab-to)))] p-1.5 shadow-[0_14px_34px_-14px_rgb(0_0_0/0.6)] ring-1 ring-inset ring-white/10">
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 left-1.5 rounded-[1.25rem] bg-white/15 ring-1 ring-inset ring-white/15 transition-transform duration-300 ease-out will-change-transform"
            style={{ width: 'calc((100% - 0.75rem) / 4)', transform: `translate3d(${index * 100}%, 0, 0)` }}
          />
          <ul className="relative grid grid-cols-4">
            {NAV_ITEMS.map(({ id, icon }) => {
              const active = tab === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      haptic(vibrate)
                      onChange(id)
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-[3.25rem] w-full touch-manipulation flex-col items-center justify-center gap-0.5 rounded-[1.25rem] text-[11px] font-bold leading-none transition-colors duration-200 ${
                      active ? 'text-lime' : 'text-[#f1e9e4]/75 active:text-white'
                    }`}
                  >
                    <Icon name={icon} size={22} strokeWidth={active ? 2.3 : 2} />
                    <span className="mt-1">{t.nav[id]}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}

/** Tablet and desktop: the same tabs inside the green header. */
export function HeaderNav({ tab, onChange }) {
  const index = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === tab))
  return (
    <nav aria-label={t.nav.label} className="hidden md:block">
      <ul className="relative grid grid-cols-4 rounded-2xl bg-black/15 p-1 ring-1 ring-inset ring-white/15 backdrop-blur">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-xl bg-white shadow-card transition-transform duration-300 ease-spring"
          style={{ width: 'calc((100% - 0.5rem) / 4)', transform: `translateX(${index * 100}%)` }}
        />
        {NAV_ITEMS.map(({ id, icon }) => {
          const active = tab === id
          return (
            <li key={id} className="relative">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
                  active ? 'text-[#2d7749]' : 'text-white/85 hover:text-white'
                }`}
              >
                <Icon name={icon} size={16} />
                {t.nav[id]}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
