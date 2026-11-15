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
import PlantPreview from './PlantPreview'
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
const FLOOR =
  'rounded-3xl bg-[radial-gradient(ellipse_at_50%_0%,rgb(var(--glow)/0.16),transparent_60%),linear-gradient(to_bottom,var(--floor-top),var(--floor-bottom))] ring-1 ring-inset ring-zinc-800/60'

function Stat({ value, label, aria, tone = '' }) {
  return (
    <div aria-label={aria} className="flex flex-col items-center gap-0.5 px-2 py-1 text-center">
      <span className={`num font-display text-xl font-bold leading-tight ${tone || 'text-zinc-50'}`}>{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
    </div>
  )
}

/** "My forest": every grown and withered plant, by day / week / month / year, plus the plant collection. */
export default function ForestView({ onStartFocus, onShare }) {
  const { sessions } = useAppStore().state
  const categories = useCategoryLookup()
  const [period, setPeriod] = useState('day')
  const [anchor, setAnchor] = useState(() => new Date())
  const [selected, setSelected] = useState(null)
  const [preview, setPreview] = useState(null)
  const shownPlant = useRetained(selected)

  const range = useMemo(() => periodRange(period, anchor), [period, anchor])
  const plants = useMemo(() => sessionsIn(sessions, range), [sessions, range])
  const grown = plants.filter((s) => s.status === 'completed')
  const minutes = grown.reduce((m, s) => m + s.durationSec / 60, 0)
  const current = isCurrentPeriod(period, anchor)
  const label = periodLabel(period, range)
  const completedCount = completed(sessions).length
  const withered = plants.length - grown.length

  return (
    <div className="flex flex-col gap-6">
      <Card aria-label={t.forest.title}>
        <Segmented
          label={t.forest.title}
          value={period}
          options={PERIODS.map((p) => ({ id: p, label: t.forest.periods[p] }))}
          onChange={(p) => {
            setPeriod(p)
            setAnchor(new Date())
          }}
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" aria-label={t.forest.prev} onClick={() => setAnchor((a) => shiftPeriod(period, a, -1))} className="icon-btn size-11">
            <Icon name="chevronLeft" size={20} />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate font-display text-lg font-bold text-zinc-50" aria-live="polite">
              {label}
            </p>
            {!current && (
              <button type="button" onClick={() => setAnchor(new Date())} className="text-xs font-semibold text-sand underline-offset-2 hover:underline">
                {t.forest.backToNow}
              </button>
            )}
          </div>
          <button type="button" aria-label={t.forest.next} disabled={current} onClick={() => setAnchor((a) => shiftPeriod(period, a, 1))} className="icon-btn size-11">
            <Icon name="chevronRight" size={20} />
          </button>
        </div>

        {plants.length > 0 ? (
          <>
            <div className="mt-2 grid grid-cols-3 divide-x divide-zinc-800">
              <Stat value={grown.length} label={t.forest.stat.grown} aria={t.forest.grown(grown.length)} tone="text-olive-300" />
              <Stat value={withered} label={t.forest.stat.withered} aria={t.forest.withered(withered)} tone={withered ? 'text-zinc-400' : 'text-zinc-600'} />
              <Stat value={formatMinutes(minutes)} label={t.forest.stat.focus} />
            </div>
            {/* The forest floor: plants in planting order, every other one set back a little. */}
            <div className={`mt-4 flex min-h-36 flex-col justify-end p-3 sm:p-4 ${FLOOR}`}>
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
                        className="group relative block aspect-square w-full rounded-xl transition active:scale-90"
                      >
                        <span aria-hidden="true" className="absolute inset-x-[18%] bottom-[6%] h-[10%] rounded-full bg-black/25 blur-[2px]" />
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
            {grown.length > 0 && (
              <button type="button" onClick={() => onShare({ sessions: plants, label })} className="btn-ghost mt-4 min-h-11 w-full">
                <Icon name="share" size={16} className="text-sand" /> {t.forest.share}
              </button>
            )}
          </>
        ) : (
          <div className={`mt-4 flex flex-col items-center gap-3 px-6 py-8 text-center ${FLOOR}`}>
            <span className="animate-float">
              <ForestScene item="tolgy" progress={0.02} backdrop={false} className="size-20" />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">{completedCount ? t.forest.empty : t.forest.emptyNow}</p>
            {current && (
              <button type="button" onClick={onStartFocus} className="btn-primary mt-1 min-h-12">
                {t.forest.emptyCta}
              </button>
            )}
          </div>
        )}
      </Card>

      {/* The collection as green cards: tap one to watch it grow; a bar fills towards each unlock. */}
      <section className="flex flex-col gap-3">
        <SectionTitle>{t.forest.collection}</SectionTitle>
        <p className="-mt-2 px-1 text-sm text-zinc-500">{t.forest.collectionHint}</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {GROWTH_IDS.map((id, i) => {
            const open = isUnlocked(id, completedCount)
            const at = unlockAt(id)
            const color = Object.values(categories).find((c) => c.growth === id)?.color ?? '#2d7749'
            const name = growthItem(id).name
            return (
              <li key={id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <LeafTile
                  title={name}
                  onClick={() => setPreview({ id, color })}
                  ariaLabel={t.forest.preview(name)}
                  className={`h-full w-full ${open ? '' : 'saturate-[0.55]'}`}
                  art={
                    <span className={`relative block size-full ${open ? '' : 'opacity-60 grayscale'}`}>
                      <ForestScene item={id} color={color} progress={1} backdrop={false} className="size-full" />
                    </span>
                  }
                >
                  {open ? (
                    <span className="chip mt-2 bg-white/25 text-white ring-1 ring-inset ring-white/30">
                      <Icon name="check" size={12} strokeWidth={3} /> {t.forest.unlocked}
                    </span>
                  ) : (
                    <>
                      <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-white/90">
                        <Icon name="lock" size={11} /> {t.forest.locked(at - completedCount)}
                      </span>
                      <LeafBar value={completedCount / at} label={`${completedCount}/${at}`} />
                    </>
                  )}
                </LeafTile>
              </li>
            )
          })}
        </ul>
      </section>

      <Sheet open={selected !== null} onClose={() => setSelected(null)} title={growthItem((categories[shownPlant?.categoryId] ?? DELETED).growth).name}>
        {shownPlant && <PlantDetails session={shownPlant} category={categories[shownPlant.categoryId] ?? DELETED} />}
      </Sheet>
      <PlantPreview plant={preview} completedCount={completedCount} onClose={() => setPreview(null)} />
    </div>
  )
}

function PlantDetails({ session: s, category }) {
  const failed = s.status === 'failed'
  const row = 'flex items-baseline justify-between gap-4 border-t border-zinc-800 py-3 text-sm first:border-t-0'
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="size-56 animate-scene-in overflow-hidden rounded-full shadow-lift ring-1 ring-zinc-800">
        <ForestScene item={category.growth} color={category.color} progress={growthOf(s)} withered={failed} className="size-full" />
      </div>
      <dl className="w-full">
        <div className={row}>
          <dt className="text-zinc-500">{t.forest.category}</dt>
          <dd className="flex items-center gap-2 font-semibold text-zinc-100">
            <span className="size-2 rounded-full" style={{ background: category.color }} />
            {category.name}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-zinc-500">{t.forest.when}</dt>
          <dd className="text-right tabular-nums font-semibold text-zinc-100">
            {new Date(s.start).toLocaleDateString(getLocale(), { month: 'long', day: 'numeric' })}, {timeOf(s.start)}–{timeOf(s.end)}
          </dd>
        </div>
        <div className={row}>
          <dt className="text-zinc-500">{t.forest.duration}</dt>
          <dd className="tabular-nums font-semibold text-zinc-100">{formatMinutes(s.durationSec / 60)}</dd>
        </div>
        <div className={row}>
          <dt className="text-zinc-500">{t.forest.statusLabel}</dt>
          <dd className={`font-semibold ${failed ? 'text-rose' : 'text-olive-300'}`}>
            {t.forest.status[s.status]}
            {failed && s.reason ? ` · ${t.exportFile.reason[s.reason] ?? s.reason}` : ''}
          </dd>
        </div>
      </dl>
    </div>
  )
}
