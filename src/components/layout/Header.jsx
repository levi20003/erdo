import { useProgress } from '../../hooks/useProgress'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import { useTheme } from '../ThemeRoot'
import Icon from '../ui/Icon'
import Ring from '../ui/Ring'
import { HeaderNav } from './Nav'

/** Logo, level chip (opens Stats), light/dark switch, and the tabs on larger screens. */
export default function Header({ tab, onTab }) {
  const { actions } = useAppStore()
  const theme = useTheme()
  const { level } = useProgress()

  return (
    <header className="flex items-center gap-2.5 px-1 py-1">
      <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" className="size-9 rounded-xl shadow-card ring-1 ring-zinc-800" />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[1.35rem] font-semibold leading-none tracking-tight text-zinc-50">
          Focus<span className="text-sand">Grove</span>
        </h1>
        <p className="mt-0.5 hidden truncate text-xs text-zinc-500 min-[420px]:block">{t.appTagline}</p>
      </div>
      <HeaderNav tab={tab} onChange={onTab} />
      <button
        type="button"
        onClick={() => onTab('stats')}
        aria-label={`${t.level.label(level.level)} · ${t.level.xp(level.xp, level.next)}`}
        className="press flex h-10 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 pl-1 pr-3 text-xs font-semibold text-zinc-200 shadow-card"
      >
        <Ring value={level.progress} size={30} stroke={3}>
          <Icon name="bolt" size={12} className="text-sand" />
        </Ring>
        <span className="num">{t.level.chip(level.level)}</span>
      </button>
      <button
        type="button"
        onClick={() => actions.setPref('theme', theme === 'dark' ? 'light' : 'dark')}
        aria-label={t.theme.toggle}
        title={t.theme.toggle}
        className="press grid size-10 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 shadow-card hover:text-zinc-50"
      >
        <span key={theme} className="animate-pop-in">
          <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={17} />
        </span>
      </button>
    </header>
  )
}
