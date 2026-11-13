import { DEFAULT_AVATAR } from '../../lib/config'

export const AVATAR_EMOJI = {
  sprout: '🌱',
  fox: '🦊',
  owl: '🦉',
  deer: '🦌',
  bear: '🐻',
  hedgehog: '🦔',
  rabbit: '🐰',
  squirrel: '🐿️',
  frog: '🐸',
}

/** The profile picture: an animal of the forest in a soft circle (like the design's avatar). */
export default function Avatar({ id = DEFAULT_AVATAR, size = 44, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_50%_35%,#f4f8e2,#cfe3c4)] shadow-[0_4px_12px_-4px_rgb(0_0_0/0.35)] ring-2 ring-white/80 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.56 }}
    >
      <span className="leading-none">{AVATAR_EMOJI[id] ?? AVATAR_EMOJI[DEFAULT_AVATAR]}</span>
    </span>
  )
}
