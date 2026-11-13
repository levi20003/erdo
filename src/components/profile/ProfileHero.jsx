import { memo } from 'react'
import { useCountUp } from '../../hooks/useCountUp'
import { useProgress } from '../../hooks/useProgress'
import { getLocale, t } from '../../lib/strings'
import Icon from '../ui/Icon'
import Ring from '../ui/Ring'

function Stat({ value, decimals = 0, label, delay }) {
  const shown = useCountUp(value, { duration: 1200, delay })
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-zinc-950/60 px-3 py-3 ring-1 ring-inset ring-zinc-800/80">
      <span className="num font-display text-2xl font-semibold text-zinc-50 sm:text-3xl">
        {shown.toLocaleString(getLocale(), { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      </span>
      <span className="text-[11px] leading-tight text-zinc-500">{label}</span>
    </div>
  )
}

/** Stats screen header: level badge, title, XP progress, and the three headline numbers. */
function ProfileHero({ totalMin, completedCount, bestStreak, className = '' }) {
  const { level, title } = useProgress()
  const span = level.next - level.floor
  const into = Math.round(useCountUp(level.xp - level.floor, { duration: 1300 }))

  return (
    <section className={`pale-card p-5 sm:p-7 ${className}`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(var(--sand)/0.22),transparent_65%)] opacity-50 dark:opacity-100"
      />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-16 hidden size-72 rounded-full bg-[radial-gradient(circle,rgb(45_119_73/0.28),transparent_65%)] dark:block" />
      <div className="relative flex items-center gap-4 sm:gap-6">
        <Ring value={level.progress} size={92} stroke={7} glow>
          <span className="flex flex-col items-center leading-none">
            <span className="num font-display text-4xl font-semibold text-zinc-50">{level.level}</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.level.unit}</span>
          </span>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="eyebrow flex items-center gap-1.5 text-sand">
            <Icon name="bolt" size={12} /> {t.level.label(level.level)}
          </p>
          <h2 className="mt-1 font-display text-3xl font-medium leading-tight tracking-tight text-zinc-50 sm:text-4xl">{title}</h2>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bar-fill shadow-[0_0_12px_rgb(204_212_120/0.5)] transition-[width] duration-[1300ms] ease-out"
              style={{ width: `${Math.max(2, level.progress * 100)}%` }}
            />
          </div>
          <p className="num mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs text-zinc-500">
            <span>{t.level.xp(into, span)}</span>
            <span>{t.level.toNext(level.next - level.xp)}</span>
          </p>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat value={totalMin / 60} decimals={totalMin > 0 && totalMin < 600 ? 1 : 0} label={t.profile.hours} delay={100} />
        <Stat value={completedCount} label={t.profile.plants} delay={200} />
        <Stat value={bestStreak} label={t.profile.bestStreak} delay={300} />
      </div>
      <p className="relative mt-3 text-[11px] text-zinc-500">{t.level.howTo}</p>
    </section>
  )
}

export default memo(ProfileHero)
