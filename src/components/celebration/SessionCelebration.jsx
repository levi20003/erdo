import { useEffect, useMemo, useState } from 'react'
import { growthItem } from '../../lib/growth'
import { levelOf, titleIndex, xpOf } from '../../lib/levels'
import { completed, computeStreak } from '../../lib/stats'
import { unlockedAt } from '../../lib/unlocks'
import { t } from '../../lib/strings'
import { dayKey } from '../../lib/time'
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
  const { sessions, prefs } = useAppStore().state
  const categories = useCategoryLookup()
  const session = sessions.at(-1)
  const info = useMemo(() => {
    const done = completed(sessions)
    const xpAfter = xpOf(sessions)
    const before = levelOf(xpOf(sessions.slice(0, -1)))
    const after = levelOf(xpAfter)
    const today = dayKey()
    return {
      streak: computeStreak(sessions).current,
      // Did this very session unlock a new plant, reach the daily goal, or level up?
      unlocked: unlockedAt(done.length),
      goalReached: done.filter((s) => dayKey(s.end) === today).length === prefs.dailyGoal,
      before,
      after,
      levelUp: after.level > before.level,
      minutes: Math.round((session?.durationSec ?? 0) / 60),
    }
  }, [sessions, prefs.dailyGoal, session])

  if (!celebrating || session?.status !== 'completed') return null
  const category = categories[session.categoryId]
  const item = growthItem(category?.growth)
  const { streak, unlocked, goalReached, before, after, levelUp, minutes } = info

  return (
    <div
      key={session.id}
      role="status"
      aria-live="assertive"
      className="celebrate-overlay pointer-events-none fixed inset-0 z-[55] grid place-items-center overflow-hidden bg-zinc-950/85 px-6 backdrop-blur-sm"
    >
      <span className="sr-only">
        {t.celebrate.label}: {item.name} {t.celebrate.grown}. {t.celebrate.minutes(minutes)}. {t.celebrate.xp(minutes)}.
        {levelUp && ` ${t.celebrate.levelUp(after.level, t.levels.titles[titleIndex(after.level)])}.`}
        {goalReached && ` ${t.celebrate.goalReached}`}
      </span>
      <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
        <div className="celebrate-rays absolute size-[140vmax] bg-[conic-gradient(from_0deg,transparent_0deg,rgb(204_212_120/0.10)_10deg,transparent_20deg,transparent_40deg,rgb(64_160_100/0.12)_50deg,transparent_60deg,transparent_80deg,rgb(204_212_120/0.10)_90deg,transparent_100deg,transparent_120deg,rgb(64_160_100/0.12)_130deg,transparent_140deg,transparent_160deg,rgb(204_212_120/0.10)_170deg,transparent_180deg,transparent_200deg,rgb(64_160_100/0.12)_210deg,transparent_220deg,transparent_240deg,rgb(204_212_120/0.10)_250deg,transparent_260deg,transparent_280deg,rgb(64_160_100/0.12)_290deg,transparent_300deg,transparent_320deg,rgb(204_212_120/0.10)_330deg,transparent_340deg)] [mask-image:radial-gradient(circle,black_10%,transparent_55%)]" />
        <div className="celebrate-flare absolute size-[90vmin] rounded-full bg-[radial-gradient(circle,rgb(233_238_190/0.55),rgb(204_212_120/0.25)_25%,rgb(45_119_73/0.18)_50%,transparent_70%)]" />
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
        <p className="celebrate-rise mt-1 font-display text-4xl font-medium tracking-tight text-zinc-50" style={{ '--delay': '450ms' }}>
          {item.name} <span className="text-zinc-400">{t.celebrate.grown}</span>
        </p>
        <XpBar before={before} after={after} levelUp={levelUp} gained={minutes} />
        {levelUp && (
          <p className="celebrate-pop mt-3 flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#40a064,#2d7749)] px-4 py-2 font-display text-lg font-semibold text-cream shadow-button" style={{ animationDelay: '1300ms' }}>
            <Icon name="bolt" size={18} /> {t.celebrate.levelUp(after.level, t.levels.titles[titleIndex(after.level)])}
          </p>
        )}
        <div className="celebrate-rise mt-4 flex flex-wrap items-center justify-center gap-2 text-xs" style={{ '--delay': '700ms' }}>
          <span className="chip bg-olive/20 px-3 py-1.5 text-olive-200 ring-1 ring-inset ring-olive/40">{t.celebrate.minutes(minutes)}</span>
          {streak > 0 && (
            <span className="chip bg-sand/15 px-3 py-1.5 text-sand-200 ring-1 ring-inset ring-sand/30">
              <Icon name="flame" size={13} /> {t.celebrate.streak(streak)}
            </span>
          )}
          {goalReached && (
            <span className="chip bg-sand/20 px-3 py-1.5 text-sand-100 ring-1 ring-inset ring-sand/50">
              <Icon name="target" size={13} /> {t.celebrate.goalReached}
            </span>
          )}
          {unlocked && (
            <span className="chip bg-sand/20 px-3 py-1.5 text-sand-100 ring-1 ring-inset ring-sand/60">
              <Icon name="sprout" size={13} /> {t.celebrate.unlocked(growthItem(unlocked).name)}
            </span>
          )}
        </div>
        <p className="celebrate-rise mt-5 text-[11px] text-zinc-500" style={{ '--delay': '1000ms' }}>
          {t.celebrate.breakSoon}
        </p>
      </div>
    </div>
  )
}

/** The XP bar filling up with this session's minutes (to the brim, then over, on a level-up). */
function XpBar({ before, after, levelUp, gained }) {
  const [width, setWidth] = useState(before.progress * 100)
  useEffect(() => {
    const id = setTimeout(() => setWidth(levelUp ? 100 : after.progress * 100), 650)
    return () => clearTimeout(id)
  }, [after, levelUp])
  return (
    <div className="celebrate-rise mt-4 w-64 max-w-full" style={{ '--delay': '550ms' }}>
      <div className="mb-1.5 flex items-baseline justify-between text-xs">
        <span className="font-semibold text-sand">{t.celebrate.xp(gained)}</span>
        <span className="num text-zinc-500">{t.level.label(before.level)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bar-fill shadow-[0_0_14px_rgb(204_212_120/0.7)] transition-[width] duration-[900ms] ease-out"
          style={{ width: `${Math.max(3, width)}%` }}
        />
      </div>
    </div>
  )
}
