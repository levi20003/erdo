import { useMemo, useState } from 'react'
import { FOCUS_SEC } from '../../lib/config'
import { isCurrentPeriod, PERIODS, periodRange, sessionsIn, shiftPeriod } from '../../lib/forest'
import { GROWTH_IDS, growthItem } from '../../lib/growth'
import { completed } from '../../lib/stats'
import { getLocale, t } from '../../lib/strings'
import { formatMinutes, shortDate } from '../../lib/time'
import { isUnlocked, unlockAt } from '../../lib/unlocks'
import { useAppStore, useCategoryLookup } from '../../store/AppStore'
import { DELETED } from '../dashboard/CategoryBars'
import ForestScene from '../growth/ForestScene'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import Sheet, { useRetained } from '../ui/Sheet'

const MAX_SHOWN = 150

function periodLabel(period, { start, end }) {
  const locale = getLocale()
  const thisYear = start.getFullYear() === new Date().getFullYear()
  if (period === 'day')
    return start.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', ...(thisYear ? {} : { year: 'numeric' }) })
  if (period === 'week') return `${shortDate(start)} – ${shortDate(new Date(end.getTime() - 1))}`
  if (period === 'month') return start.toLocaleDateString(locale, { year: 'numeric', month: 'long' })
  return String(start.getFullYear())
}

const timeOf = (ms) => new Date(ms).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' })
const growthOf = (s) => (s.status === 'completed' ? 1 : Math.min(1, s.durationSec / FOCUS_SEC))

/** "My forest": every grown and withered plant, by day / week / month / year, plus the plant collection. */
export default function ForestView({ onStartFocus, onShare }) {
  const { sessions } = useAppStore().state
  const categories = useCategoryLookup()
  const [period, setPeriod] = useState('day')
  const [anchor, setAnchor] = useState(() => new Date())
  const [selected, setSelected] = useState(null)
  const shownPlant = useRetained(selected)

  const range = useMemo(() => periodRange(period, anchor), [period, anchor])
  const plants = useMemo(() => sessionsIn(sessions, range), [sessions, range])
  const grown = plants.filter((s) => s.status === 'completed')
  const minutes = grown.reduce((m, s) => m + s.durationSec / 60, 0)
  const current = isCurrentPeriod(period, anchor)
  const label = periodLabel(period, range)
  const completedCount = completed(sessions).length

  const navButton =
    'grid size-11 place-items-center rounded-xl text-zinc-300 transition hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-25'

  return (
    <div className="flex flex-col gap-4">
      <Card
        title={t.forest.title}
        icon={<Icon name="tree" size={13} />}
        action={
          grown.length > 0 && (
            <button
              type="button"
              onClick={() => onShare({ sessions: plants, label })}
              className="flex min-h-10 items-center gap-1.5 rounded-xl border border-zinc-800 px-3 text-xs text-zinc-200 transition hover:border-sand/40"
            >
              <Icon name="share" size={14} className="text-sand" /> {t.forest.share}
            </button>
          )
        }
      >
        <div role="radiogroup" aria-label={t.forest.title} className="mb-4 grid grid-cols-4 gap-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={period === p}
              onClick={() => {
                setPeriod(p)
                setAnchor(new Date())
              }}
              className={`min-h-10 rounded-xl text-sm transition ${period === p ? 'bg-zinc-800 font-medium text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              {t.forest.periods[p]}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <button type="button" aria-label={t.forest.prev} onClick={() => setAnchor((a) => shiftPeriod(period, a, -1))} className={navButton}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-base font-medium text-zinc-100" aria-live="polite">
              {label}
            </p>
            {!current && (
              <button type="button" onClick={() => setAnchor(new Date())} className="text-xs text-sand underline-offset-2 hover:underline">
                {t.forest.backToNow}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label={t.forest.next}
            disabled={current}
            onClick={() => setAnchor((a) => shiftPeriod(period, a, 1))}
            className={navButton}
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>

        {plants.length > 0 ? (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-olive/50 bg-olive-900/60 px-2.5 py-1 text-olive-200">{t.forest.grown(grown.length)}</span>
              {plants.length > grown.length && (
                <span className="rounded-full border border-zinc-800 px-2.5 py-1 text-zinc-400">{t.forest.withered(plants.length - grown.length)}</span>
              )}
              <span className="ml-auto tabular-nums text-zinc-300">{formatMinutes(minutes)}</span>
            </div>
            {/* The forest floor: plants in planting order, every other one set back a little. */}
            <div className="rounded-3xl bg-[radial-gradient(ellipse_at_50%_0%,rgb(201_171_132/0.10),transparent_60%),linear-gradient(to_bottom,#0f110b,#16180f)] p-3 ring-1 ring-inset ring-zinc-800/60 sm:p-4">
              <ul className="flex flex-wrap justify-center gap-y-2">
                {plants.slice(0, MAX_SHOWN).map((s, i) => {
                  const cat = categories[s.categoryId] ?? DELETED
                  return (
                    <li key={s.id} className={`basis-1/5 px-0.5 min-[420px]:basis-1/6 sm:basis-[12.5%] lg:basis-[10%] ${i % 2 ? 'translate-y-1.5' : ''}`}>
                      <button
                        type="button"
                        onClick={() => setSelected(s)}
                        aria-label={t.forest.plantLabel(cat.name, timeOf(s.end), t.forest.status[s.status])}
                        className="relative block aspect-square w-full rounded-xl transition hover:bg-white/5 active:scale-95"
                      >
                        <span aria-hidden="true" className="absolute inset-x-[18%] bottom-[6%] h-[10%] rounded-full bg-black/40 blur-[2px]" />
                        <ForestScene
                          item={cat.growth}
                          color={cat.color}
                          progress={growthOf(s)}
                          withered={s.status === 'failed'}
                          backdrop={false}
                          className="relative size-full"
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
              {plants.length > MAX_SHOWN && <p className="mt-3 text-center text-xs text-zinc-400">{t.forest.more(plants.length - MAX_SHOWN)}</p>}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-zinc-800 px-6 py-10 text-center">
            <ForestScene item="tolgy" progress={0.02} backdrop={false} className="size-20 opacity-70" />
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">{completedCount ? t.forest.empty : t.forest.emptyNow}</p>
            {current && (
              <button type="button" onClick={onStartFocus} className="rounded-xl bg-olive px-5 py-3 text-sm font-medium text-sand-100 hover:bg-olive-400">
                {t.forest.emptyCta}
              </button>
            )}
          </div>
        )}
      </Card>

      <Card title={t.forest.collection} icon={<Icon name="leaf" size={13} />}>
        <p className="-mt-2 mb-4 text-xs text-zinc-400">{t.forest.collectionHint}</p>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {GROWTH_IDS.map((id) => {
            const open = isUnlocked(id, completedCount)
            const color = Object.values(categories).find((c) => c.growth === id)?.color ?? '#7d8247'
            return (
              <li key={id} className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-center ${open ? 'border-zinc-800 bg-zinc-950/50' : 'border-dashed border-zinc-800'}`}>
                <span className={`relative block size-16 ${open ? '' : 'opacity-35 grayscale'}`}>
                  <ForestScene item={id} color={color} progress={1} backdrop={false} className="size-full" />
                  {!open && (
                    <span className="absolute inset-0 grid place-items-center">
                      <Icon name="lock" size={18} className="text-zinc-200" />
                    </span>
                  )}
                </span>
                <span className={`text-xs leading-tight ${open ? 'text-zinc-200' : 'text-zinc-400'}`}>{growthItem(id).name}</span>
                <span className={`text-[11px] ${open ? 'text-olive-300' : 'text-sand'}`}>
                  {open ? t.forest.unlocked : t.forest.locked(unlockAt(id) - completedCount)}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>

      <Sheet open={selected !== null} onClose={() => setSelected(null)} title={growthItem((categories[shownPlant?.categoryId] ?? DELETED).growth).name}>
        {shownPlant && <PlantDetails session={shownPlant} category={categories[shownPlant.categoryId] ?? DELETED} />}
      </Sheet>
    </div>
  )
}

function PlantDetails({ session: s, category }) {
  const failed = s.status === 'failed'
  const row = 'flex items-baseline justify-between gap-4 border-t border-zinc-800 py-3 text-sm'
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="size-56 overflow-hidden rounded-full ring-1 ring-zinc-800">
        <ForestScene item={category.growth} color={category.color} progress={growthOf(s)} withered={failed} className="size-full" />
      </div>
      <dl className="w-full">
        <div className={row}>
          <dt className="text-zinc-400">{t.forest.category}</dt>
          <dd className="flex items-center gap-2 text-zinc-100">
            <span className="size-2 rounded-full" style={{ background: category.color }} />
            {category.name}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-zinc-400">{t.forest.when}</dt>
          <dd className="text-right tabular-nums text-zinc-100">
            {new Date(s.start).toLocaleDateString(getLocale(), { month: 'long', day: 'numeric' })}, {timeOf(s.start)}–{timeOf(s.end)}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-zinc-400">{t.forest.duration}</dt>
          <dd className="tabular-nums text-zinc-100">{formatMinutes(s.durationSec / 60)}</dd>
        </div>
        <div className={row}>
          <dt className="text-zinc-400">{t.forest.statusLabel}</dt>
          <dd className={failed ? 'text-[#e2b8bc]' : 'text-olive-300'}>
            {t.forest.status[s.status]}
            {failed && s.reason ? ` · ${t.exportFile.reason[s.reason] ?? s.reason}` : ''}
          </dd>
        </div>
      </dl>
    </div>
  )
}
