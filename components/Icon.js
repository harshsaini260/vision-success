/* ─── ICONS — one symbol language for every control ───
   Apple's guidance is to use one consistent set of symbols for actions,
   drawn to one weight, rather than emoji, whose look changes from phone
   to phone and whose colour cannot follow the theme. These are drawn the
   way SF Symbols are: a 24-unit grid, a 1.75 stroke, round caps and
   joins, and currentColor, so an icon always matches the text beside it
   and passes the same contrast check.

   Brand marks (WhatsApp, Instagram, YouTube, Facebook) are the one
   exception, filled, because a brand's own glyph is what people
   recognise.

   Decorative by default: aria-hidden, because every control that uses
   one already carries its own words or aria-label. */

const P = {
  phone: <path d="M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 5 5l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="m4 7.5 8 5.5 8-5.5" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" /><circle cx="12" cy="10" r="2.3" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  pause: <><rect x="6.5" y="5.5" width="3.8" height="13" rx="1.1" fill="currentColor" stroke="none" /><rect x="13.7" y="5.5" width="3.8" height="13" rx="1.1" fill="currentColor" stroke="none" /></>,
  speaker: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></>,
  speakerOff: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></>,
  arrowRight: <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />,
  lockOpen: <><rect x="5" y="11" width="14" height="9.5" rx="2.2" /><path d="M8.5 11V8a3.5 3.5 0 0 1 6.8-1.2" /></>,
  download: <><path d="M12 4v11M7 10.5l5 5 5-5" /><path d="M5 19.5h14" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5z" /></>,
  repeat: <><path d="M4.5 11V9.5A3 3 0 0 1 7.5 6.5H18M15 3.5l3 3-3 3" /><path d="M19.5 13v1.5a3 3 0 0 1-3 3H6M9 20.5l-3-3 3-3" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></>,
}

const BRAND = {
  whatsapp: <path fill="currentColor" stroke="none" d="M12.04 2.5A9.43 9.43 0 0 0 3.9 16.7L2.6 21.4l4.83-1.27A9.43 9.43 0 1 0 12.04 2.5zm0 17.2a7.8 7.8 0 0 1-3.98-1.09l-.28-.17-2.87.75.77-2.8-.19-.29a7.8 7.8 0 1 1 6.55 3.6zm4.28-5.84c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.53.12-.15.23-.6.76-.74.92-.14.15-.27.17-.5.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.18-1.4-1.31-1.64-.14-.23-.02-.36.1-.48.1-.1.24-.27.35-.41.12-.14.16-.24.24-.4.08-.15.04-.29-.02-.41-.06-.12-.53-1.27-.72-1.74-.19-.46-.38-.4-.53-.4h-.45a.87.87 0 0 0-.63.29c-.21.24-.83.81-.83 1.97s.85 2.28.97 2.44c.12.16 1.67 2.55 4.05 3.58.57.24 1 .39 1.35.5.57.18 1.08.15 1.49.1.45-.07 1.38-.57 1.58-1.12.2-.55.2-1.02.14-1.12-.06-.1-.21-.16-.45-.28z" />,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" /></>,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" /></>,
  facebook: <path fill="currentColor" stroke="none" d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.87.25-1.46 1.5-1.46h1.6V4.36A21 21 0 0 0 14.3 4.2c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z" />,
}

export default function Icon({ name, size = 20, className = '', title }) {
  const shape = P[name] || BRAND[name]
  if (!shape) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`vs-icon ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {shape}
    </svg>
  )
}
