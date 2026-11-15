import { useState } from 'react'
import { MAX_NICKNAME } from '../../lib/config'
import { useProgress } from '../../hooks/useProgress'
import { t } from '../../lib/strings'
import { useAppStore } from '../../store/AppStore'
import Icon from '../ui/Icon'
import Sheet from '../ui/Sheet'
import Avatar from './Avatar'
import AvatarPicker from './AvatarPicker'

/** Profile screen header card: avatar, name, level — and the sheet that edits them. */
export default function ProfileCard({ className = '' }) {
  const { state } = useAppStore()
  const { level, title, completedCount, streak } = useProgress()
  const [editing, setEditing] = useState(false)
  const { nickname, avatar } = state.prefs
  const stats = [
    [level.level, t.level.unit],
    [completedCount, t.profile.plants],
    [streak.longest, t.profile.bestStreak],
  ]

  return (
    <section className={`pale-card animate-fade-up p-5 ${className}`}>
      <span aria-hidden="true" className="absolute -right-10 -top-14 -z-10 h-36 w-44 rounded-[48%_52%_40%_60%/55%_45%_55%_45%] bg-white/45 dark:bg-white/5" />
      <div className="flex items-center gap-4">
        <Avatar id={avatar} size={72} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-2xl font-bold leading-tight">{nickname || t.me.unnamed}</p>
          <p className="truncate text-sm font-semibold opacity-75">{title}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={t.me.edit}
          title={t.me.edit}
          className="press grid size-11 shrink-0 place-items-center rounded-full bg-[#483838] text-[#f1f3d2] shadow-[0_8px_18px_-10px_rgb(72_56_56/0.9)] hover:bg-[#5a4646]"
        >
          <Icon name="pencil" size={17} />
        </button>
      </div>
      <dl className="mt-4 grid grid-cols-3 divide-x divide-black/10 rounded-2xl bg-white/50 py-2.5 ring-1 ring-black/5 dark:divide-white/10 dark:bg-white/5 dark:ring-white/10">
        {stats.map(([value, label]) => (
          <div key={label} className="flex flex-col items-center px-2 text-center">
            <dd className="num font-display text-xl font-bold leading-tight">{value}</dd>
            <dt className="text-[11px] font-semibold leading-tight opacity-70">{label}</dt>
          </div>
        ))}
      </dl>
      <Sheet open={editing} onClose={() => setEditing(false)} title={t.me.edit} description={t.signup.privacy}>
        {editing && <ProfileForm onDone={() => setEditing(false)} />}
      </Sheet>
    </section>
  )
}

function ProfileForm({ onDone }) {
  const { state, actions } = useAppStore()
  const [name, setName] = useState(state.prefs.nickname)
  const [avatar, setAvatar] = useState(state.prefs.avatar)
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        actions.setNickname(name)
        actions.setPref('avatar', avatar)
        onDone()
      }}
    >
      <label className="flex flex-col gap-2">
        <span className="label">{t.signup.name}</span>
        <input value={name} maxLength={MAX_NICKNAME} onChange={(e) => setName(e.target.value)} placeholder={t.signup.namePlaceholder} className="input" />
      </label>
      <div className="flex flex-col gap-2">
        <span className="label">{t.avatar.label}</span>
        <AvatarPicker value={avatar} onChange={setAvatar} />
      </div>
      <button type="submit" className="btn-primary min-h-12 w-full">
        {t.me.save}
      </button>
    </form>
  )
}
