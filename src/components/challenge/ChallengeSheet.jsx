import { useState } from 'react'
import { CHALLENGE_DAYS, challengeUrl, createChallenge, DEFAULT_CHALLENGE, encodeChallenge, MAX_CHALLENGE_GOAL, myCount } from '../../lib/challenge'
import { MAX_NICKNAME } from '../../lib/config'
import { appUrl, shareLink } from '../../lib/shareLink'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import { useToast } from '../toast/ToastProvider'
import Icon from '../ui/Icon'
import Segmented from '../ui/Segmented'
import Sheet from '../ui/Sheet'

/**
 * New challenge (nickname, goal, length → link), or — with `challenge` — the
 * link that sends this user's current score to the friend.
 */
export default function ChallengeSheet({ open, onClose, challenge = null }) {
  return (
    <Sheet open={open} onClose={onClose} title={challenge ? t.challenge.linkTitle : t.challenge.newTitle}>
      {open && (challenge ? <SendLink challenge={challenge} onDone={onClose} /> : <CreateForm onDone={onClose} />)}
    </Sheet>
  )
}

function CreateForm({ onDone }) {
  const { state, actions } = useAppStore()
  const [name, setName] = useState(state.prefs.nickname)
  const [goal, setGoal] = useState(DEFAULT_CHALLENGE.goal)
  const [days, setDays] = useState(DEFAULT_CHALLENGE.days)
  const [created, setCreated] = useState(null)

  if (created) return <SendLink challenge={created} onDone={onDone} />

  const step = 'press grid size-11 place-items-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 disabled:opacity-30'
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        actions.setNickname(name)
        const c = createChallenge({ goal, days })
        actions.addChallenge(c)
        setCreated(c)
      }}
    >
      <label className="flex flex-col gap-2">
        <span className="label">{t.challenge.nickname}</span>
        <input
          value={name}
          maxLength={MAX_NICKNAME}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.challenge.nicknamePlaceholder}
          className="input"
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="label">{t.challenge.goal}</span>
        <div className="flex items-center gap-3">
          <button type="button" aria-label={t.goal.less} disabled={goal <= 1} onClick={() => setGoal((g) => Math.max(1, g - 1))} className={step}>
            <Icon name="minus" size={18} />
          </button>
          <p key={goal} className="num min-w-24 animate-pop-in text-center font-display text-3xl font-semibold text-zinc-50">
            {goal}
            <span className="ml-1 font-sans text-sm font-normal text-zinc-500">{t.challenge.goalUnit}</span>
          </p>
          <button type="button" aria-label={t.goal.more} disabled={goal >= MAX_CHALLENGE_GOAL} onClick={() => setGoal((g) => Math.min(MAX_CHALLENGE_GOAL, g + 1))} className={step}>
            <Icon name="plus" size={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="label">{t.challenge.days}</span>
        <Segmented label={t.challenge.days} value={days} onChange={setDays} options={CHALLENGE_DAYS.map((d) => ({ id: d, label: t.challenge.daysValue(d) }))} />
      </div>
      <button type="submit" className="btn-primary min-h-12 w-full">
        <Icon name="trophy" size={17} /> {t.challenge.create}
      </button>
    </form>
  )
}

function SendLink({ challenge, onDone }) {
  const { state } = useAppStore()
  const { push } = useToast()
  const [fallback, setFallback] = useState(false)
  const done = myCount(challenge, state.sessions)
  const name = state.prefs.nickname
  const url = challengeUrl(appUrl(), encodeChallenge(challenge, { name, done }))
  const text =
    challenge.role === 'host' && challenge.opponentDone === null
      ? t.challenge.shareText(name, challenge.goal, challenge.days)
      : t.challenge.updateText(name, done, challenge.goal)

  const send = async () => {
    const result = await shareLink({ url, text, title: 'FocusGrove' })
    if (result === 'copied') push(t.challenge.copied, 'success')
    if (result === 'failed') setFallback(true)
    if (result === 'shared' || result === 'copied') onDone()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sand/15 text-sand">
          <Icon name="trophy" size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-medium text-zinc-50">{t.challenge.vs(challenge.goal, challenge.days)}</p>
          <p className="text-xs text-zinc-500">{t.challenge.linkHint}</p>
        </div>
      </div>
      {fallback && (
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          aria-label={t.challenge.copy}
          className="min-h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-zinc-300"
        />
      )}
      <button type="button" onClick={send} className="btn-primary min-h-12 w-full" data-autofocus>
        <Icon name="share" size={17} /> {t.challenge.share}
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url)
            push(t.challenge.copied, 'success')
            onDone()
          } catch {
            setFallback(true)
          }
        }}
        className="btn-ghost min-h-11"
      >
        <Icon name="copy" size={16} /> {t.challenge.copy}
      </button>
    </div>
  )
}
