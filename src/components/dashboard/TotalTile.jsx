import { t } from '../../lib/strings'
import { formatHours } from '../../lib/time'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

export default function TotalTile({ totalMin, completedCount, failedCount, className = '' }) {
  const attempts = completedCount + failedCount
  const rate = attempts ? Math.round((completedCount / attempts) * 100) : 0

  return (
    <Card title={t.total} icon={<Icon name="clock" size={13} />} className={className}>
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
    </Card>
  )
}
