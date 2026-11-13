import { useEffect, useRef, useState } from 'react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { unlockAudio } from '../../lib/sound'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import ForestScene from '../growth/ForestScene'
import Icon from '../ui/Icon'

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent)

function Visual({ step }) {
  if (step === 0)
    return (
      <div className="size-56 overflow-hidden rounded-full ring-1 ring-zinc-800 sm:size-64">
        <ForestScene item="tolgy" progress={1} alive className="size-full" />
      </div>
    )
  if (step === 1)
    return (
      <div className="flex items-end gap-6">
        <div className="flex flex-col items-center gap-2">
          <ForestScene item="tolgy" progress={1} backdrop={false} className="size-32" />
          <span className="flex items-center gap-1 text-xs text-olive-300">
            <Icon name="check" size={13} /> 25:00
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ForestScene item="tolgy" progress={0.45} withered backdrop={false} className="size-32" />
          <span className="text-xs text-rose">&gt; 5 s</span>
        </div>
      </div>
    )
  return (
    <div className="grid size-56 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_40%,rgb(201_171_132/0.25),rgb(95_98_57/0.25)_60%,transparent_75%)] ring-1 ring-zinc-800 sm:size-64">
      <div className="flex items-center gap-5 text-sand">
        <Icon name="wind" size={44} strokeWidth={1.4} />
        <Icon name="volume" size={44} strokeWidth={1.4} />
      </div>
    </div>
  )
}

/** First-run introduction: three short cards, then "what are you focusing on?". Skippable at any point. */
export default function Onboarding({ onDone }) {
  const { state, actions } = useAppStore()
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState(state.selectedCategoryId)
  const { canInstall, install } = useInstallPrompt()
  const heading = useRef(null)
  const steps = t.onboarding.steps
  const last = steps.length // the "choose" step
  const total = steps.length + 1

  useEffect(() => {
    // Screen readers start reading the new step; no focus ring lands on a button.
    heading.current?.focus({ preventScroll: true })
  }, [step])

  const finish = () => {
    // This tap also unlocks audio, so the first session's chime can play (iOS).
    unlockAudio()
    actions.completeOnboarding(choice)
    onDone()
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' && step < last) setStep(step + 1)
      if (e.key === 'ArrowLeft' && step > 0) setStep(step - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, last])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.onboarding.label}
      className="fixed inset-0 z-[70] flex animate-fade-in flex-col overflow-y-auto bg-zinc-950 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-[35%] size-[140vmax] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(95_98_57/0.22),transparent_40%)]"
      />
      <header className="relative mx-auto flex w-full max-w-md items-center justify-between">
        <div className="flex gap-1.5" aria-label={t.onboarding.step(step + 1, total)}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-sand' : i < step ? 'w-1.5 bg-sand/50' : 'w-1.5 bg-zinc-700'}`} />
          ))}
        </div>
        {step < last && (
          <button type="button" onClick={finish} className="min-h-11 rounded-xl px-3 text-sm text-zinc-400 transition hover:text-zinc-100">
            {t.onboarding.skip}
          </button>
        )}
      </header>

      <main key={step} className="relative mx-auto flex w-full max-w-md flex-1 animate-fade-up flex-col items-center justify-center gap-7 py-6 text-center">
        {step < last ? (
          <>
            <Visual step={step} />
            <div className="flex flex-col gap-3">
              <h2 ref={heading} tabIndex={-1} className="font-display text-[1.75rem] font-medium leading-tight tracking-tight text-zinc-50 outline-none">{steps[step].title}</h2>
              <p className="text-base leading-relaxed text-zinc-300">{steps[step].body}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h2 ref={heading} tabIndex={-1} className="font-display text-[1.75rem] font-medium tracking-tight text-zinc-50 outline-none">{t.onboarding.chooseTitle}</h2>
              <p className="text-sm text-zinc-400">{t.onboarding.chooseHint}</p>
            </div>
            <div role="radiogroup" aria-label={t.onboarding.chooseTitle} className="grid w-full grid-cols-2 gap-2">
              {state.categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={choice === c.id}
                  onClick={() => setChoice(c.id)}
                  className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-sm transition active:scale-[0.98] ${
                    choice === c.id ? 'border-sand/60 bg-olive-900/50 text-zinc-50' : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <ForestScene item={c.growth} color={c.color} progress={1} backdrop={false} className="size-12" />
                  <span className="line-clamp-2 leading-tight">{c.name}</span>
                </button>
              ))}
            </div>
            {!isStandalone() && (
              <div className="flex w-full items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-left">
                <Icon name="download" size={18} className="mt-0.5 text-sand" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-100">{t.onboarding.installTitle}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{isIos() ? t.onboarding.installIos : t.onboarding.installOther}</p>
                </div>
                {canInstall && (
                  <button type="button" onClick={install} className="min-h-10 rounded-xl bg-olive px-3 text-xs font-medium text-cream">
                    {t.onboarding.installButton}
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-zinc-400">{t.onboarding.privacy}</p>
          </>
        )}
      </main>

      <footer className="relative mx-auto flex w-full max-w-md gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="min-h-12 flex-1 rounded-2xl border border-zinc-800 text-sm text-zinc-300 transition hover:border-zinc-700"
          >
            {t.onboarding.back}
          </button>
        )}
        <button
          type="button"
          onClick={() => (step < last ? setStep(step + 1) : finish())}
          className="btn-primary min-h-12 flex-[2] text-base"
        >
          {step < last ? t.onboarding.next : t.onboarding.start}
        </button>
      </footer>
    </div>
  )
}
