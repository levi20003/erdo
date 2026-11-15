import { DEFAULT_AVATAR } from '../../lib/config'

/*
 * Profile pictures: ten small forest characters, drawn flat on a 64×64 canvas
 * so they look the same on every phone (emoji differ per platform).
 */
const INK = '#2a2020'
const eyes = (y, x1 = 24, x2 = 40, r = 2.4) => (
  <>
    <circle cx={x1} cy={y} r={r} fill={INK} />
    <circle cx={x2} cy={y} r={r} fill={INK} />
    <circle cx={x1 + 0.8} cy={y - 0.8} r={r * 0.32} fill="#fff" />
    <circle cx={x2 + 0.8} cy={y - 0.8} r={r * 0.32} fill="#fff" />
  </>
)
const blush = (y, x1, x2) => (
  <>
    <circle cx={x1} cy={y} r="2.8" fill="#ee9a9a" opacity="0.55" />
    <circle cx={x2} cy={y} r="2.8" fill="#ee9a9a" opacity="0.55" />
  </>
)
// Hedgehog spines: a 18-point star.
const SPINES = Array.from({ length: 36 }, (_, i) => {
  const a = (i * 10 * Math.PI) / 180
  const r = i % 2 ? 20.5 : 26
  return `${(32 + r * Math.cos(a)).toFixed(1)} ${(33 + r * Math.sin(a)).toFixed(1)}`
}).join('L')

const FACES = {
  sprout: {
    bg: '#dff0d2',
    art: (
      <>
        <ellipse cx="32" cy="51" rx="12" ry="3.5" fill="#7e5454" />
        <path d="M32 50V29" stroke="#2d7749" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 37c-10 0-15-6-15-14 9 0 15 5 15 14Z" fill="#62a16a" />
        <path d="M32 31c0-10 5-16 15-16 0 9-5 16-15 16Z" fill="#40a064" />
      </>
    ),
  },
  fox: {
    bg: '#fde9cf',
    art: (
      <>
        <path d="M12 12 28 22 14 32Z" fill="#e0803c" />
        <path d="M52 12 36 22 50 32Z" fill="#e0803c" />
        <path d="M15.5 17 23 22 16.5 27Z" fill="#5b3a2e" />
        <path d="M48.5 17 41 22 47.5 27Z" fill="#5b3a2e" />
        <path d="M32 55C17 55 9 42 12 28C20 21 44 21 52 28C55 42 47 55 32 55Z" fill="#e0803c" />
        <path d="M12 30C13 44 21 53 32 55C29 45 22 36 12 30Z" fill="#fff7ea" />
        <path d="M52 30C51 44 43 53 32 55C35 45 42 36 52 30Z" fill="#fff7ea" />
        <ellipse cx="32" cy="50" rx="3.2" ry="2.5" fill={INK} />
        {eyes(36)}
      </>
    ),
  },
  owl: {
    bg: '#ece5d2',
    art: (
      <>
        <path d="M13 22 19 11 27 20Z" fill="#5d3d3d" />
        <path d="M51 22 45 11 37 20Z" fill="#5d3d3d" />
        <circle cx="32" cy="35" r="21" fill="#7e5454" />
        <path d="M24 50q4 4 8 0q4 4 8 0" fill="none" stroke="#f4e9d5" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="23.5" cy="31" r="9.5" fill="#f4e9d5" />
        <circle cx="40.5" cy="31" r="9.5" fill="#f4e9d5" />
        {eyes(31, 23.5, 40.5, 3.8)}
        <path d="M28.5 37H35.5L32 43.5Z" fill="#e0903c" />
      </>
    ),
  },
  deer: {
    bg: '#e3eed3',
    art: (
      <>
        <path d="M23 21V9M23 15l-5-4M23 12.5l4-4M41 21V9M41 15l5-4M41 12.5l-4-4" fill="none" stroke="#7e5454" strokeWidth="2.6" strokeLinecap="round" />
        <ellipse cx="13.5" cy="27" rx="7" ry="3.8" fill="#c98d5a" transform="rotate(-24 13.5 27)" />
        <ellipse cx="50.5" cy="27" rx="7" ry="3.8" fill="#c98d5a" transform="rotate(24 50.5 27)" />
        <path d="M32 56C22 56 17 46 17 35C17 25 23 19 32 19C41 19 47 25 47 35C47 46 42 56 32 56Z" fill="#c98d5a" />
        <ellipse cx="32" cy="47" rx="8.5" ry="7.5" fill="#f4e2c8" />
        <ellipse cx="32" cy="44" rx="3.4" ry="2.6" fill={INK} />
        <circle cx="27" cy="25" r="1.3" fill="#f4e2c8" />
        <circle cx="37" cy="25" r="1.3" fill="#f4e2c8" />
        <circle cx="32" cy="22.5" r="1.1" fill="#f4e2c8" />
        {eyes(34, 24.5, 39.5)}
      </>
    ),
  },
  bear: {
    bg: '#efe1d0',
    art: (
      <>
        <circle cx="16" cy="19" r="7.5" fill="#8a5a3c" />
        <circle cx="48" cy="19" r="7.5" fill="#8a5a3c" />
        <circle cx="16" cy="19" r="3.6" fill="#c79a78" />
        <circle cx="48" cy="19" r="3.6" fill="#c79a78" />
        <circle cx="32" cy="35" r="21" fill="#8a5a3c" />
        <ellipse cx="32" cy="43" rx="9.5" ry="7.5" fill="#e9cfb4" />
        <ellipse cx="32" cy="40" rx="3.6" ry="2.7" fill={INK} />
        <path d="M32 42.5v3M32 45.5q-3 2.2-5 0M32 45.5q3 2.2 5 0" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        {eyes(32)}
      </>
    ),
  },
  hedgehog: {
    bg: '#e6ebcb',
    art: (
      <>
        <path d={`M${SPINES}Z`} fill="#6b4a3a" />
        <circle cx="19" cy="31" r="4" fill="#f0d9b8" />
        <circle cx="45" cy="31" r="4" fill="#f0d9b8" />
        <ellipse cx="32" cy="41" rx="15" ry="13" fill="#f0d9b8" />
        <ellipse cx="32" cy="46.5" rx="2.8" ry="2.3" fill={INK} />
        {blush(44, 22, 42)}
        {eyes(38.5, 26, 38, 2.2)}
      </>
    ),
  },
  rabbit: {
    bg: '#cfe3c4',
    art: (
      <>
        <ellipse cx="23.5" cy="16" rx="6" ry="14" fill="#f8f4ef" transform="rotate(-8 23.5 16)" />
        <ellipse cx="40.5" cy="16" rx="6" ry="14" fill="#f8f4ef" transform="rotate(8 40.5 16)" />
        <ellipse cx="23.5" cy="17" rx="2.6" ry="9.5" fill="#f0b8b8" transform="rotate(-8 23.5 17)" />
        <ellipse cx="40.5" cy="17" rx="2.6" ry="9.5" fill="#f0b8b8" transform="rotate(8 40.5 17)" />
        <ellipse cx="32" cy="41" rx="18" ry="15.5" fill="#f8f4ef" />
        <path d="M29.8 43.5h4.4l-2.2 2.6Z" fill="#e58f8f" />
        <path d="M32 46.1v2M32 48.1q-2.6 2.2-4.8 0M32 48.1q2.6 2.2 4.8 0" fill="none" stroke="#8a7a7a" strokeWidth="1.3" strokeLinecap="round" />
        {blush(45, 21, 43)}
        {eyes(39, 25, 39)}
      </>
    ),
  },
  squirrel: {
    bg: '#f3e3cc',
    art: (
      <>
        <path d="M16 27 18 10 29 22Z" fill="#a84f2a" />
        <path d="M48 27 46 10 35 22Z" fill="#a84f2a" />
        <ellipse cx="32" cy="37" rx="19" ry="18" fill="#c96a3a" />
        <ellipse cx="32" cy="44.5" rx="12" ry="8.5" fill="#f6dfc4" />
        <ellipse cx="32" cy="40.5" rx="2.8" ry="2.2" fill={INK} />
        <rect x="30.3" y="45.5" width="3.4" height="3.6" rx="0.8" fill="#fff" />
        {eyes(33.5, 24, 40, 2.6)}
      </>
    ),
  },
  frog: {
    bg: '#def0cf',
    art: (
      <>
        <circle cx="20.5" cy="22" r="8.5" fill="#6fb35a" />
        <circle cx="43.5" cy="22" r="8.5" fill="#6fb35a" />
        <circle cx="20.5" cy="22" r="5.4" fill="#fff" />
        <circle cx="43.5" cy="22" r="5.4" fill="#fff" />
        <ellipse cx="32" cy="39" rx="22" ry="16.5" fill="#6fb35a" />
        <ellipse cx="32" cy="47.5" rx="13" ry="6.5" fill="#b9de9c" opacity="0.85" />
        <path d="M21 41q11 8.5 22 0" fill="none" stroke="#2f6a2f" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="29.3" cy="34.5" r="0.9" fill="#2f6a2f" />
        <circle cx="34.7" cy="34.5" r="0.9" fill="#2f6a2f" />
        {blush(41, 15.5, 48.5)}
        {eyes(22, 20.5, 43.5, 2.6)}
      </>
    ),
  },
  bird: {
    bg: '#dbe8ee',
    art: (
      <>
        <path d="M31 16q-3-6 2-8q0 4 3.5 5.5Z" fill="#8a6a52" />
        <circle cx="32" cy="35" r="20" fill="#8a6a52" />
        <path d="M15.5 40C18 53 46 53 48.5 40C44 31 20 31 15.5 40Z" fill="#e0703c" />
        <path d="M24 55.5v3.5M40 55.5v3.5" stroke="#b08a52" strokeWidth="2" strokeLinecap="round" />
        <path d="M28.5 34h7l-3.5 5.5Z" fill="#f2c14e" />
        {eyes(29.5, 25, 39)}
      </>
    ),
  },
}

/** The profile picture: one of the forest characters in a soft circle. */
export default function Avatar({ id = DEFAULT_AVATAR, size = 44, className = '' }) {
  const face = FACES[id] ?? FACES[DEFAULT_AVATAR]
  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 overflow-hidden rounded-full shadow-[0_4px_12px_-4px_rgb(0_0_0/0.35)] ring-2 ring-white/85 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} className="block">
        <rect width="64" height="64" fill={face.bg} />
        {face.art}
      </svg>
    </span>
  )
}
