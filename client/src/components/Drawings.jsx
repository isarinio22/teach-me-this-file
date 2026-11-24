// The two drawings in the app, made for it as plain SVG. Their colors are design tokens
// (fill-sage, stroke-ink, ...), so they follow styles.css like everything else.
// Both are decoration: screen readers skip them.

export function TutorAvatar({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={`shrink-0 rounded-pill ${className}`}>
      <rect width="64" height="64" className="fill-sage" />
      <path d="M8 70 C8 52 20 47 32 47 C44 47 56 52 56 70 Z" className="fill-blue" />
      <path d="M27 44 h10 v6 c0 3 -10 3 -10 0 Z" strokeWidth="1.6" strokeLinejoin="round" className="fill-paper stroke-ink" />
      <circle cx="32" cy="30" r="15" strokeWidth="1.8" className="fill-paper stroke-ink" />
      <path
        d="M16.6 29 C15 16 25 10.5 33 11 C42 11.5 49.5 17 47.4 29 C45 24.5 41 21.5 36 20.5 C37 22 37 23 36.5 24 C32 20.5 24 20.5 20.5 23 C18.5 24.5 17.5 26.5 16.6 29 Z"
        className="fill-ink"
      />
      <g fill="none" strokeWidth="1.6" strokeLinecap="round" className="stroke-ink">
        <circle cx="25.6" cy="31.6" r="4.6" />
        <circle cx="38.4" cy="31.6" r="4.6" />
        <path d="M30.2 31.2 q1.8 -1.4 3.6 0" />
        <path d="M27.5 38.6 Q32 42.4 36.5 38.6" />
      </g>
      <circle cx="25.8" cy="32" r="1.3" className="fill-ink" />
      <circle cx="38.2" cy="32" r="1.3" className="fill-ink" />
      <circle cx="21.4" cy="38" r="2.3" className="fill-pen/30" />
      <circle cx="42.6" cy="38" r="2.3" className="fill-pen/30" />
    </svg>
  )
}

export function Pencil({ className = '' }) {
  return (
    <svg viewBox="0 0 208 28" aria-hidden="true" className={`pointer-events-none ${className}`}>
      <rect x="2" y="4" width="20" height="20" rx="6" className="fill-pen/55" />
      <rect x="18" y="4" width="16" height="20" className="fill-grid" />
      <path d="M23 4 v20 M29 4 v20" strokeWidth="1.5" className="stroke-graphite/45" />
      <rect x="34" y="4" width="134" height="20" className="fill-pencil" />
      <rect x="34" y="4" width="134" height="6" className="fill-paper/40" />
      <rect x="34" y="18" width="134" height="6" className="fill-ink/10" />
      <path d="M168 4 L200 14 L168 24 Z" className="fill-paper" />
      <path d="M168 4 L200 14 L168 24 Z" className="fill-pencil/40" />
      <path d="M188 10.25 L200 14 L188 17.75 Z" className="fill-graphite" />
    </svg>
  )
}
