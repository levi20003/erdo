import { challengeRange, challengeStatus } from '../../lib/challenge'
import { getLocale, t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'

function Lane({ label, value, goal, mine }) {
  const pct = value === null ? 0 : Math.min(100, (value / goal) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className={`w-16 shrink-0 truncate text-xs ${mine ? 'font-semibold text-zinc-100' : 'text-zinc-400'}`}>{label}</span>
      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-out ${mine ? 'bar-fill' : 'bg-zinc-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="num w-12 shrink-0 text-right text-xs text-zinc-300">{value === null ? '–' : `${value}/${goal}`}</span>
    </div>
  )
}

/** One challenge: both lanes, time left or the result, and "send my score". */
export default function ChallengeRow({ challenge: c, onSend, onRemove, compact = false }) {
  const { sessions } = useAppStore().state
  const s = challengeStatus(c, sessions)
  const name = c.opponent || t.challenge.friend
  const status = s.over
    ? s.leading === 'me'
      ? t.challenge.result.me
      : s.leading === 'them'
        ? t.challenge.result.them(c.opponent)
        : s.leading === 'tie'
          ? t.challenge.result.tie
          : t.challenge.over
    : s.leading === 'me'
      ? t.challenge.leading.me
      : s.leading === 'them'
        ? t.challenge.leading.them(c.opponent)
        : s.leading === 'tie'
          ? t.challenge.leading.tie
          : t.challenge.waiting
  const good = s.leading === 'me' || s.reached

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-zinc-100">
          <Icon name="trophy" size={15} className="shrink-0 text-sand" />
          <span className="truncate">{t.challenge.vs(c.goal, c.days)}</span>
        </p>
        <span className={`chip shrink-0 ${s.over ? 'bg-zinc-800 text-zinc-300' : 'bg-olive/15 text-olive-300'}`}>
          {s.over ? t.challenge.over : t.challenge.daysLeft(s.daysLeft)}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Lane label={t.challenge.you} value={s.mine} goal={c.goal} mine />
        <Lane label={name} value={s.theirs} goal={c.goal} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-xs font-medium ${good ? 'text-sand' : 'text-zinc-400'}`}>
          {status}
          {!compact && c.opponentAt && (
            <span className="ml-1 font-normal text-zinc-500">
              · {new Date(c.opponentAt).toLocaleDateString(getLocale(), { month: 'short', day: 'numeric' })}
            </span>
          )}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {onRemove && (
            <button type="button" onClick={onRemove} aria-label={t.challenge.remove} className="press grid size-9 place-items-center rounded-xl text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
              <Icon name="trash" size={15} />
            </button>
          )}
          {!s.over && onSend && (
            <button type="button" onClick={onSend} className="press flex min-h-9 items-center gap-1.5 rounded-xl bg-sand/15 px-3 text-xs font-semibold text-sand hover:bg-sand/25">
              <Icon name="share" size={13} /> {t.challenge.send}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Running challenges, plus ones that ended in the last three days (to show the result). */
export function visibleChallenges(challenges, now = Date.now()) {
  return challenges.filter((c) => now < challengeRange(c).end.getTime() + 3 * 864e5)
}
