import { useEffect, useRef, useState } from 'react'
import { MAX_NICKNAME } from '../../lib/config'
import { parseBackup } from '../../lib/exportData'
import { unlockAudio } from '../../lib/sound'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import { Pines, Wave } from '../art/Shapes'
import { CategoryList } from '../focus/CategorySheet'
import AvatarPicker from '../profile/AvatarPicker'
import { useToast } from '../toast/ToastProvider'
import Icon from '../ui/Icon'

/*
 * First run, in the look of the design: a splash with the forest edge, a
 * "sign up" that creates a local profile (name + avatar, no password), a
 * "sign in" that restores a backup on a new device, and "what are you focusing on?".
 */
const PALE = 'bg-[#d2d79f] text-[#3a2c2c] dark:bg-[#1e1c15] dark:text-[#ece9d6]'
const field =
  'min-h-12 w-full rounded-lg border-2 border-[#483838]/70 bg-white/40 px-3 text-base text-[#2a2020] placeholder:text-[#483838]/45 focus:border-[#2d7749] focus:outline-none dark:border-[#d2d79f]/40 dark:bg-white/5 dark:text-[#f1f3d2] dark:placeholder:text-[#d2d79f]/35'

/** The brown band with the big lime title, ending in a wave — "SIGN UP" / "SIGN IN". */
function BarkHeader({ title, subtitle, headingRef }) {
  return (
    <div className="relative">
      <div className="bg-[#483838] px-6 pb-2 pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-[3.2rem] font-extrabold uppercase leading-none tracking-tight text-[#a9d492] outline-none">
          {title}
        </h2>
        <p className="mt-3 max-w-[15rem] text-[15px] font-bold leading-snug">{subtitle}</p>
      </div>
      <Wave variant="hill" fill="#483838" flip className="h-16 w-full rotate-180" />
    </div>
  )
}

export default function Onboarding({ onDone }) {
  const { state, actions } = useAppStore()
  const { push } = useToast()
  const [step, setStep] = useState('welcome') // welcome · signup · signin · choose
  const [name, setName] = useState(state.prefs.nickname)
  const [avatar, setAvatar] = useState(state.prefs.avatar === 'sprout' ? 'fox' : state.prefs.avatar)
  const [choice, setChoice] = useState(state.selectedCategoryId)
  const heading = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    // Screen readers start reading the new step; no focus ring lands on a button.
    heading.current?.focus({ preventScroll: true })
  }, [step])

  const finish = (categoryId = choice) => {
    // This tap also unlocks audio, so the first session's chime can play (iOS).
    unlockAudio()
    actions.completeOnboarding(categoryId)
    onDone()
  }

  const restore = async (file) => {
    const imported = parseBackup(await file.text())
    if (!imported) return push(t.importResult.invalid, 'danger')
    const known = new Set(state.sessions.map((s) => s.id))
    const fresh = imported.sessions.filter((s) => !known.has(s.id)).length
    const knownCats = new Set(state.categories.map((c) => c.id))
    actions.importMerge(imported)
    push(t.importResult.done(fresh, imported.categories.filter((c) => !knownCats.has(c.id)).length), 'success')
    finish(state.selectedCategoryId)
  }

  const skip = (
    <button type="button" onClick={() => finish()} className="min-h-11 rounded-xl px-3 text-sm font-bold opacity-70 transition hover:opacity-100">
      {t.onboarding.skip}
    </button>
  )

  return (
    <div role="dialog" aria-modal="true" aria-label={t.onboarding.label} className={`fixed inset-0 z-[70] flex flex-col overflow-y-auto ${PALE}`}>
      {step === 'welcome' && (
        <div key="welcome" className="flex min-h-full animate-fade-in flex-col">
          <div className="flex justify-end px-3 pt-[max(0.5rem,env(safe-area-inset-top))]">{skip}</div>
          <div className="px-7 pb-6 text-center">
            <h2 ref={heading} tabIndex={-1} className="font-display text-[3rem] font-extrabold uppercase leading-none tracking-tight text-[#5a1f1f] outline-none dark:text-[#d2d79f]">
              {t.welcome.title}
            </h2>
            <p className="mt-1 font-display text-xl font-bold uppercase tracking-wide text-[#5a1f1f] dark:text-[#d2d79f]">{t.welcome.subtitle}</p>
            <p className="mt-2 text-lg font-bold tracking-[0.3em] text-[#5a1f1f]/70 dark:text-[#d2d79f]/60">• • •</p>
            <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-[#6b4a3a] dark:text-[#d9d4bd]">{t.welcome.body}</p>
          </div>
          <div className="relative min-h-[17rem] flex-1">
            {/* Pale sky → bark-brown swell → dark and sage green hills → the forest edge, as in the design. */}
            <svg aria-hidden="true" viewBox="0 0 200 160" preserveAspectRatio="none" className="absolute inset-0 size-full">
              <path d="M0 22C34 2 78 30 118 24S176 4 200 16V160H0Z" fill="#483838" />
              <path d="M96 64C128 44 168 58 200 38V160H96Z" className="fill-[#42855b] dark:fill-[#2c5e3f]" />
              <path d="M0 56C36 82 86 60 122 70S178 92 200 80V160H0Z" className="fill-[#90b77d] dark:fill-[#3b5b3c]" />
            </svg>
            <Pines fill="#0d0b0b" className="absolute inset-x-0 bottom-0 h-[60%] w-full" />
          </div>
          <button
            type="button"
            onClick={() => setStep('signup')}
            className="min-h-16 bg-[linear-gradient(180deg,#c7dcae,#7fae73)] pb-[env(safe-area-inset-bottom)] font-display text-lg font-extrabold uppercase tracking-[0.08em] text-[#1d1717] transition active:brightness-95"
          >
            {t.welcome.start}
          </button>
        </div>
      )}

      {step === 'signup' && (
        <form
          key="signup"
          className="flex min-h-full animate-fade-in flex-col"
          onSubmit={(e) => {
            e.preventDefault()
            actions.setNickname(name)
            actions.setPref('avatar', avatar)
            setStep('choose')
          }}
        >
          <BarkHeader title={t.signup.title} subtitle={t.signup.subtitle} headingRef={heading} />
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">{t.signup.name}</span>
              <input value={name} maxLength={MAX_NICKNAME} onChange={(e) => setName(e.target.value)} placeholder={t.signup.namePlaceholder} className={field} />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold">{t.avatar.label}</span>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>
            <p className="text-center text-sm">
              {t.signup.haveMet}{' '}
              <button type="button" onClick={() => setStep('signin')} className="font-bold text-[#2d7749] underline-offset-2 hover:underline dark:text-[#a9d492]">
                {t.signup.restore}
              </button>
            </p>
            <div className="mt-auto flex flex-col items-center gap-3">
              <button type="submit" className="btn-bark min-h-12 w-48">
                {t.signup.next}
              </button>
              <p className="text-center text-xs opacity-70">{t.signup.privacy}</p>
            </div>
          </div>
        </form>
      )}

      {step === 'signin' && (
        <div key="signin" className="flex min-h-full animate-fade-in flex-col">
          <BarkHeader title={t.signin.title} subtitle={t.signin.subtitle} headingRef={heading} />
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <p className="text-[15px] leading-relaxed">{t.signin.body}</p>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-bark min-h-12 w-full">
              <Icon name="download" size={16} className="rotate-180" /> {t.signin.choose}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              data-testid="restore-input"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) restore(file)
              }}
            />
            <p className="text-center text-sm">
              {t.signin.newHere}{' '}
              <button type="button" onClick={() => setStep('signup')} className="font-bold text-[#2d7749] underline-offset-2 hover:underline dark:text-[#a9d492]">
                {t.signin.create}
              </button>
            </p>
          </div>
        </div>
      )}

      {step === 'choose' && (
        <div key="choose" className="relative isolate flex min-h-full animate-fade-in flex-col overflow-hidden px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
          {/* The design's corners: dark bark at the top, green hills at the bottom. */}
          <span aria-hidden="true" className="absolute -right-16 -top-16 -z-10 size-36 rotate-12 rounded-[2.5rem] bg-[#2e2222]" />
          <span aria-hidden="true" className="absolute -left-12 -top-6 -z-10 h-20 w-24 -rotate-12 rounded-br-[3rem] bg-[#3a8a5a]" />
          <svg aria-hidden="true" viewBox="0 0 200 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 -z-10 h-28 w-full">
            <path d="M0 60V30L30 18 60 40 100 6 140 34 170 22 200 36V60Z" fill="#285f3c" />
            <path d="M0 60V44L40 30 80 50 120 28 160 46 200 34V60Z" fill="#1d4a2e" />
          </svg>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
            <div className="ml-auto mr-2 flex max-w-[14rem] items-start gap-2 pt-24 text-right">
              <svg aria-hidden="true" viewBox="0 0 40 60" className="mt-2 h-14 w-9 shrink-0 text-current opacity-70">
                <path d="M34 4C10 8 4 30 14 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="m8 46 6 7 5-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-semibold italic leading-snug">{t.choose.note}</p>
            </div>
            <h2 ref={heading} tabIndex={-1} className="mt-6 font-display text-2xl font-bold outline-none">
              {t.onboarding.chooseTitle}
            </h2>
            <CategoryList value={choice} onChange={setChoice} className="mt-3" />
            <div className="mt-6 flex items-center justify-between pb-20">
              <button type="button" onClick={() => setStep('signup')} className="min-h-11 rounded-xl px-2 text-sm font-bold opacity-75 hover:opacity-100">
                {t.onboarding.back}
              </button>
              <button type="button" onClick={() => finish()} aria-label={t.choose.finish} className="btn-bark min-h-12 px-5">
                {t.choose.finish} <Icon name="arrowRight" size={20} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
