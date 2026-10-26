import { memo } from 'react'
import { t } from '../../lib/strings'
import { formatHours, formatMinutes, parseDayKey, shortDate } from '../../lib/time'
import { useCategoryLookup } from '../../store/AppStore'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

function TotalTile({ totalMin, completedCount, failedCount, insights, onShare, className = '' }) {
  const categories = useCategoryLookup()
  const attempts = completedCount + failedCount
  const rate = attempts ? Math.round((completedCount / attempts) * 100) : 0
  const favorite = insights?.favoriteCategoryId ? categories[insights.favoriteCategoryId] : null

  return (
    <Card
      title={t.total}
      icon={<Icon name="clock" size={13} />}
      className={className}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-olive-900 text-olive-300 ring-1 ring-olive/40">
          <Icon name="clock" size={24} />
        </span>
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-100">
          {formatHours(totalMin)} <span className="text-base font-normal text-zinc-500">{t.hours}</span>
        </p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-2.5">
          <dt className="text-[11px] text-zinc-500">{t.sessions}</dt>
          <dd className="text-lg tabular-nums text-zinc-200">{completedCount}</dd>
        </div>
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-2.5">
          <dt className="text-[11px] text-zinc-500">{t.successRate}</dt>
          <dd className="text-lg tabular-nums text-zinc-200">{attempts ? `${rate}%` : '—'}</dd>
        </div>
      </dl>

      {insights && completedCount > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">{t.insights.title}</h3>
          <dl className="flex flex-col gap-2 text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-zinc-500">{t.insights.thisWeek}</dt>
              <dd className="text-right tabular-nums text-zinc-200">
                {formatMinutes(insights.last7Min)}
                {insights.deltaPct !== null && (
                  <span className={`block text-[11px] ${insights.deltaPct >= 0 ? 'text-olive-300' : 'text-zinc-500'}`}>
                    {t.insights.vsLast(insights.deltaPct)}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-zinc-500">
                {insights.activeDays} {t.insights.activeDays}
              </dt>
              <dd className="text-right tabular-nums text-zinc-200">
                {formatMinutes(insights.avgPerActiveDayMin)} <span className="text-zinc-500">{t.insights.avgPerActiveDay}</span>
              </dd>
            </div>
            {favorite && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-zinc-500">{t.insights.favorite}</dt>
                <dd className="flex min-w-0 items-center gap-1.5 text-zinc-200">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: favorite.color }} />
                  <span className="truncate">{favorite.name}</span>
                </dd>
              </div>
            )}
            {insights.bestDay && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-zinc-500">{t.insights.bestDay}</dt>
                <dd className="tabular-nums text-zinc-200">
                  {shortDate(parseDayKey(insights.bestDay.key))} · {formatMinutes(insights.bestDay.min)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {completedCount > 0 && (
        <button
          type="button"
          onClick={onShare}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 transition hover:border-sand/40 hover:bg-zinc-800/60"
        >
          <Icon name="share" size={15} className="text-sand" /> {t.share.title}
        </button>
      )}
    </Card>
  )
}

// Memoized: App re-renders every second while a timer runs; this card only depends on its props and the store.
export default memo(TotalTile)
