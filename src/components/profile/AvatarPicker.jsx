import { AVATARS } from '../../lib/config'
import { t } from '../../lib/strings'
import Avatar from './Avatar'

/** Nine forest animals to pick from. */
export default function AvatarPicker({ value, onChange, className = '' }) {
  return (
    <div role="radiogroup" aria-label={t.avatar.label} className={`grid grid-cols-5 gap-2 sm:grid-cols-9 ${className}`}>
      {AVATARS.map((id) => {
        const on = id === value
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={t.avatar.names[id]}
            onClick={() => onChange(id)}
            className={`press grid aspect-square place-items-center rounded-2xl transition ${on ? 'bg-olive-900 ring-2 ring-olive-400' : 'hover:bg-zinc-800/60'}`}
          >
            <Avatar id={id} size={44} className={on ? 'scale-110 transition-transform duration-300 ease-spring' : 'transition-transform duration-300'} />
          </button>
        )
      })}
    </div>
  )
}
