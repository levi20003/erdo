import { AVATARS } from '../../lib/config'
import { t } from '../../lib/strings'
import Avatar from './Avatar'

/** Ten forest characters to pick from, five to a row. */
export default function AvatarPicker({ value, onChange, className = '' }) {
  return (
    <div role="radiogroup" aria-label={t.avatar.label} className={`grid grid-cols-5 gap-x-1 gap-y-2 ${className}`}>
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
            className="press grid aspect-square place-items-center rounded-full"
          >
            <Avatar
              id={id}
              size={52}
              className={`transition duration-300 ease-spring ${on ? 'scale-110 !ring-[3px] !ring-olive-400' : 'opacity-80 hover:opacity-100'}`}
            />
          </button>
        )
      })}
    </div>
  )
}
