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
import { LeafBar, LeafTile } from '../focus/FocusSide'
import Card from '../ui/Card'
import SectionTitle from '../ui/SectionTitle'
import Segmented from '../ui/Segmented'
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
const growthOf = (s) => (s.status === 'completed' ? 1 : Math.min(1, s.durationSec / (s.plannedSec ?? FOCUS_SEC)))

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
        aria-label={t.forest.title}
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
        <Segmented
          label={t.forest.title}
          className="mb-4"
          value={period}
          options={PERIODS.map((p) => ({ id: p, label: t.forest.periods[p] }))}
          onChange={(p) => {
            setPeriod(p)
            setAnchor(new Date())
          }}
        />

        <div className="mb-4 flex items-center justify-between gap-2">
          <button type="button" aria-label={t.forest.prev} onClick={() => setAnchor((a) => shiftPeriod(period, a, -1))} className={navButton}>
            <Icon name="chevronLeft" size={18} />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate font-display text-lg font-medium text-zinc-50" aria-live="polite">
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
              <span className="chip bg-olive/20 text-olive-200 ring-1 ring-inset ring-olive/40">
                <Icon name="sprout" size={12} /> {t.forest.grown(grown.length)}
              </span>
              {plants.length > grown.length && <span className="chip bg-zinc-800 text-zinc-400">{t.forest.withered(plants.length - grown.length)}</span>}
              <span className="num ml-auto font-display text-base font-semibold text-zinc-100">{formatMinutes(minutes)}</span>
            </div>
            {/* The forest floor: plants in planting order, every other one set back a little. */}
            <div className="rounded-3xl bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--glow)/0.16),transparent_60%),linear-gradient(to_bottom,var(--floor-top),var(--floor-bottom))] p-3 ring-1 ring-inset ring-zinc-800/60 sm:p-4">
              <ul key={`${period}-${range.start.getTime()}`} className="flex flex-wrap justify-center gap-y-2">
                {plants.slice(0, MAX_SHOWN).map((s, i) => {
                  const cat = categories[s.categoryId] ?? DELETED
                  return (
                    <li
                      key={s.id}
                      className={`basis-1/5 animate-sprout px-0.5 min-[420px]:basis-1/6 sm:basis-[12.5%] lg:basis-[10%] ${i % 2 ? 'mt-2' : ''}`}
                      style={{ animationDelay: `${Math.min(i, 40) * 25}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(s)}
                        aria-label={t.forest.plantLabel(cat.name, timeOf(s.end), t.forest.status[s.status])}
                        className="group relative block aspect-square w-full rounded-xl transition hover:bg-zinc-50/5 active:scale-90"
                      >
                        <span aria-hidden="true" className="absolute inset-x-[18%] bottom-[6%] h-[10%] rounded-full bg-black/30 blur-[2px]" />
                        <ForestScene
                          item={cat.growth}
                          color={cat.color}
                          progress={growthOf(s)}
                          withered={s.status === 'failed'}
                          backdrop={false}
                          className="relative size-full origin-bottom transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:scale-110"
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
              <button type="button" onClick={onStartFocus} className="btn-primary min-h-12">
                {t.forest.emptyCta}
              </button>
            )}
          </div>
        )}
      </Card>

      {/* The collection as the design's green word cards: a bar fills towards each unlock. */}
      <section className="flex flex-col gap-3">
        <SectionTitle>{t.forest.collection}</SectionTitle>
        <p className="-mt-1 px-1 text-sm text-zinc-400">{t.forest.collectionHint}</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {GROWTH_IDS.map((id, i) => {
            const open = isUnlocked(id, completedCount)
            const at = unlockAt(id)
            const color = Object.values(categories).find((c) => c.growth === id)?.color ?? '#2d7749'
            return (
              <li key={id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <LeafTile
                  title={growthItem(id).name}
                  subtitle={open ? t.forest.unlocked : t.forest.locked(at - completedCount)}
                  className={`h-full ${open ? '' : 'saturate-[0.6]'}`}
                  art={
                    <span className={`relative block size-full ${open ? '' : 'opacity-50 grayscale'}`}>
                      <ForestScene item={id} color={color} progress={1} backdrop={false} className="size-full" />
                      {!open && <Icon name="lock" size={14} className="absolute bottom-0 right-0 text-white drop-shadow" />}
                    </span>
                  }
                >
                  <LeafBar value={at ? Math.min(1, completedCount / at) : 1} label={at && !open ? `${completedCount}/${at}` : null} />
                </LeafTile>
              </li>
            )
          })}
        </ul>
      </section>

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
      <div className="size-56 animate-scene-in overflow-hidden rounded-full shadow-lift ring-1 ring-zinc-800">
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
          <dd className={failed ? 'text-rose' : 'text-olive-300'}>
            {t.forest.status[s.status]}
            {failed && s.reason ? ` · ${t.exportFile.reason[s.reason] ?? s.reason}` : ''}
          </dd>
        </div>
      </dl>
    </div>
  )
}
