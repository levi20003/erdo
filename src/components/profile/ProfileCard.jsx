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
  const { level, title, completedCount } = useProgress()
  const [editing, setEditing] = useState(false)
  const { nickname, avatar } = state.prefs

  return (
    <section className={`pale-card animate-fade-up p-5 ${className}`}>
      <span aria-hidden="true" className="absolute -right-8 -top-10 -z-10 h-28 w-36 rounded-[48%_52%_40%_60%/55%_45%_55%_45%] bg-zinc-950/30 dark:bg-white/5" />
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setEditing(true)} aria-label={t.me.edit} className="press rounded-full">
          <Avatar id={avatar} size={76} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-2xl font-bold">{nickname || t.me.unnamed}</p>
          <p className="text-sm font-semibold opacity-80">
            {t.level.label(level.level)} · {title}
          </p>
          <p className="num text-xs opacity-70">
            {completedCount} {t.profile.plants}
          </p>
        </div>
      </div>
      <button type="button" onClick={() => setEditing(true)} className="btn-bark mt-4 min-h-11 w-full">
        <Icon name="pencil" size={15} /> {t.me.edit}
      </button>
      <ProfileSheet open={editing} onClose={() => setEditing(false)} />
    </section>
  )
}

function ProfileSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title={t.me.edit} description={t.signup.privacy}>
      {open && <ProfileForm onDone={onClose} />}
    </Sheet>
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
        <span className="text-sm font-semibold text-zinc-300">{t.signup.name}</span>
        <input
          value={name}
          maxLength={MAX_NICKNAME}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.signup.namePlaceholder}
          className="min-h-12 rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-olive-400 focus:outline-none"
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-zinc-300">{t.avatar.label}</span>
        <AvatarPicker value={avatar} onChange={setAvatar} />
      </div>
      <button type="submit" className="btn-primary min-h-12 w-full">
        {t.me.save}
      </button>
    </form>
  )
}
