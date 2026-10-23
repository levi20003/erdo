import { useMemo } from 'react'
import { growthItem } from '../../lib/growth'
import { computeStreak } from '../../lib/stats'
import { t } from '../../lib/strings'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'

// Golden-angle spiral: an even, organic-looking burst without randomness.
const SWARM = Array.from({ length: 30 }, (_, i) => {
  const angle = i * 2.39996
  const distance = 90 + ((i * 37) % 130)
  return {
    tx: Math.cos(angle) * distance,
    ty: Math.sin(angle) * distance * 0.8,
    size: 3 + (i % 3),
    delay: (i % 10) * 0.04,
    gold: i % 3 !== 0,
  }
})

/**
 * Plays between a completed focus block and the break (the break is scheduled
 * to start after it): a golden/olive flare, a firefly swarm, and the grown item.
 */
export default function SessionCelebration({ celebrating }) {
  const { sessions } = useAppStore().state
  const categories = useCategoryLookup()
  const session = sessions.at(-1)
  const streak = useMemo(() => computeStreak(sessions).current, [sessions])

  if (!celebrating || session?.status !== 'completed') return null
  const category = categories[session.categoryId]
  const item = growthItem(category?.growth)

  return (
    <div
      key={session.id}
      role="status"
      aria-live="assertive"
      className="celebrate-overlay pointer-events-none fixed inset-0 z-[55] grid place-items-center overflow-hidden bg-zinc-950/85 px-6 backdrop-blur-sm"
    >
      <span className="sr-only">
        {t.celebrate.label}: {item.name} {t.celebrate.grown}. {t.celebrate.minutes}.
      </span>
      <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
        <div className="celebrate-rays absolute size-[140vmax] bg-[conic-gradient(from_0deg,transparent_0deg,rgb(201_171_132/0.10)_10deg,transparent_20deg,transparent_40deg,rgb(128_132_77/0.12)_50deg,transparent_60deg,transparent_80deg,rgb(201_171_132/0.10)_90deg,transparent_100deg,transparent_120deg,rgb(128_132_77/0.12)_130deg,transparent_140deg,transparent_160deg,rgb(201_171_132/0.10)_170deg,transparent_180deg,transparent_200deg,rgb(128_132_77/0.12)_210deg,transparent_220deg,transparent_240deg,rgb(201_171_132/0.10)_250deg,transparent_260deg,transparent_280deg,rgb(128_132_77/0.12)_290deg,transparent_300deg,transparent_320deg,rgb(201_171_132/0.10)_330deg,transparent_340deg)] [mask-image:radial-gradient(circle,black_10%,transparent_55%)]" />
        <div className="celebrate-flare absolute size-[90vmin] rounded-full bg-[radial-gradient(circle,rgb(230_214_191/0.55),rgb(201_171_132/0.25)_25%,rgb(95_98_57/0.18)_50%,transparent_70%)]" />
        {SWARM.map((f, i) => (
          <span
            key={i}
            className="swarm absolute rounded-full"
            style={{
              width: f.size,
              height: f.size,
              background: f.gold ? '#f3ebdf' : '#c9cb9c',
              boxShadow: `0 0 ${f.size * 3}px ${f.gold ? 'rgb(201 171 132 / 0.9)' : 'rgb(169 172 114 / 0.9)'}`,
              '--tx': `${f.tx}px`,
              '--ty': `${f.ty}px`,
              '--delay': `${f.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center text-center">
        <div className="celebrate-pop relative grid size-36 place-items-center">
          <span aria-hidden="true" className="absolute inset-2 rounded-full bg-sand/15 blur-2xl" />
          <ForestScene item={item.id} color={category?.color} progress={1} backdrop={false} className="relative size-full" />
        </div>
        <p className="celebrate-rise mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-sand" style={{ '--delay': '350ms' }}>
          {t.celebrate.label}
        </p>
        <p className="celebrate-rise mt-1 text-3xl font-semibold tracking-tight text-zinc-50" style={{ '--delay': '450ms' }}>
          {item.name} <span className="font-normal text-zinc-400">{t.celebrate.grown}</span>
        </p>
        <div className="celebrate-rise mt-4 flex flex-wrap items-center justify-center gap-2 text-xs" style={{ '--delay': '600ms' }}>
          <span className="rounded-full border border-olive/60 bg-olive-900/80 px-3 py-1.5 text-olive-200">{t.celebrate.minutes}</span>
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full border border-sand/30 bg-sand-900/80 px-3 py-1.5 text-sand-200">
              <Icon name="flame" size={13} /> {t.celebrate.streak(streak)}
            </span>
          )}
        </div>
        <p className="celebrate-rise mt-5 text-[11px] text-zinc-500" style={{ '--delay': '900ms' }}>
          {t.celebrate.breakSoon}
        </p>
      </div>
    </div>
  )
}
