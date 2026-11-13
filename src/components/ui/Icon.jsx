const PATHS = {
  play: <path d="M7 5v14l11-7L7 5Z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  skip: <><path d="M6 5l9 7-9 7V5Z" /><path d="M18 5v14" /></>,
  expand: <><path d="M4 9V4h5" /><path d="M20 9V4h-5" /><path d="M4 15v5h5" /><path d="M20 15v5h-5" /></>,
  collapse: <><path d="M9 4v5H4" /><path d="M15 4v5h5" /><path d="M9 20v-5H4" /><path d="M15 20v-5h5" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  flame: <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  pencil: <path d="M4 20h4L19 9l-4-4L4 16v4Z" />,
  trash: <><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  close: <><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>,
  offline: <><path d="M3 3l18 18" /><path d="M8 8a5 5 0 0 0-1 9.8h10.5M20.5 16A4 4 0 0 0 17 10h-1a6 6 0 0 0-5.3-4" /></>,
  download: <><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  tree: <><path d="M12 22v-6" /><path d="M12 3 6 12h3l-3 4h12l-3-4h3Z" /></>,
  leaf: <><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19 14 10" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  volume: <><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" /><path d="M15.5 9a4 4 0 0 1 0 6" /><path d="M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  volumeOff: <><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5Z" /><path d="m16 10 4 4M20 10l-4 4" /></>,
  star: <path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z" />,
  share: <><path d="M12 15V4" /><path d="m8 8 4-4 4 4" /><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  chart: <><path d="M5 20V10M12 20V4M19 20v-7" /></>,
  wind: <><path d="M3 8h11a3 3 0 1 0-3-3" /><path d="M3 12h16a3 3 0 1 1-3 3" /><path d="M3 16h7" /></>,
  stretch: <><circle cx="12" cy="4.5" r="1.8" /><path d="M5 9l7 2 7-2M12 11v4l-3 6M12 15l3 6" /></>,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.01" /></>,
  sprout: <><path d="M12 21v-9" /><path d="M12 12c-5 0-7-3-7-7 4 0 7 2 7 7Z" /><path d="M12 14c0-5 3-8 8-8 0 5-3 8-8 8Z" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" /><path d="M12 13v4M8.5 20h7M10 17h4v3h-4Z" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.5" /><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z M19 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" />,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  minus: <path d="M5 12h14" />,
  arrowRight: <><path d="M4 12h16" /><path d="m14 6 6 6-6 6" /></>,
  home: <><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
  // Stretch illustrations
  neck: <><circle cx="12" cy="8" r="3.5" /><path d="M9 16c0-2 1.3-3 3-3s3 1 3 3M6 21c0-3 2.5-5 6-5s6 2 6 5" /><path d="M5.5 6.5a7 7 0 0 1 3-3.5M18.5 6.5a7 7 0 0 0-3-3.5" /><path d="M16.5 2.5l2 .5-.5 2" /></>,
  shoulders: <><circle cx="12" cy="6" r="2.5" /><path d="M5 21v-6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v6" /><path d="M3 10a4 4 0 0 1 3-4M21 10a4 4 0 0 0-3-4" /><path d="M6 4.5 6.3 6.3 4.6 6.8M18 4.5l-.3 1.8 1.7.5" /></>,
  wrist: <><path d="M3 15h8l5-5" /><path d="M16 10V5.5a1.5 1.5 0 0 1 3 0V12a6 6 0 0 1-6 6H3" /><path d="M21 3l-2 1" /></>,
  chest: <><circle cx="12" cy="5" r="2.5" /><path d="M12 8v7M12 15l-3 6M12 15l3 6" /><path d="M3 7l4 3 5-1 5 1 4-3" /></>,
  walk: <><circle cx="13" cy="4" r="2" /><path d="M10 21l2-6 3 3v3M12 15l-1-5 4 1 2 3M11 10l-3 2-1 3" /></>,
}

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name]}
    </svg>
  )
}
