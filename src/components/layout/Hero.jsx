import { t } from '../../lib/strings'
import { dayKey } from '../../lib/time'
import { useAppStore } from '../../store/AppStore'
import { Pines } from '../art/Shapes'
import Avatar from '../profile/Avatar'
import { useTheme } from '../ThemeRoot'
import Icon from '../ui/Icon'
import { HeaderNav } from './Nav'

// The tagline changes once a day, like a quote of the day.
const tagline = () => {
  const list = t.hero.taglines
  const n = [...dayKey()].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return list[n % list.length]
}

/**
 * The green header of the design: greeting (or the screen's name), a quiet
 * tagline, and the profile avatar. The first card of each screen overlaps it.
 */
export default function Hero({ screen, onTab }) {
  const { state, actions } = useAppStore()
  const theme = useTheme()
  const { nickname, avatar } = state.prefs
  const title = screen === 'focus' ? t.hero.hi(nickname) : t.nav[screen]

  return (
    <header className="relative isolate overflow-hidden bg-[linear-gradient(180deg,rgb(var(--hero-from)),rgb(var(--hero-to)))] pb-16 pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <span aria-hidden="true" className="absolute -right-10 -top-16 -z-10 size-48 rounded-[48%_52%_40%_60%/55%_45%_55%_45%] bg-[rgb(var(--blob))] opacity-20" />
      <Pines fill="rgb(0 0 0 / 0.12)" className="absolute inset-x-0 bottom-0 -z-10 h-16 w-full" />
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 key={screen} className="animate-fade-up truncate font-display text-[1.85rem] font-bold leading-tight tracking-tight drop-shadow-sm">
            {title}
          </h1>
          <p className="truncate text-sm italic text-white/80">{tagline()}</p>
        </div>
        <HeaderNav tab={screen} onChange={onTab} />
        <button
          type="button"
          onClick={() => actions.setPref('theme', theme === 'dark' ? 'light' : 'dark')}
          aria-label={t.theme.toggle}
          title={t.theme.toggle}
          className="press grid size-10 place-items-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur hover:bg-white/25"
        >
          <span key={theme} className="animate-pop-in">
            <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={17} />
          </span>
        </button>
        <button type="button" onClick={() => onTab('settings')} aria-label={t.hero.profile} className="press rounded-full">
          <Avatar id={avatar} size={50} />
        </button>
      </div>
    </header>
  )
}
