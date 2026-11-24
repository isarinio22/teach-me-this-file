// The tutor's portrait and the pencil. Both are decoration: screen readers skip them.
import tutorPortrait from './tutor.webp'

// The tutor is the app's author: a photo cut out and set in ink on sage, with this file's pencil
// tucked behind the ear. One prepared 256px image, so nothing is composed in the browser.
export function TutorAvatar({ className = '' }) {
  return <img src={tutorPortrait} alt="" className={`shrink-0 rounded-pill ${className}`} />
}

// Drawn for this app. Its colors are design tokens (fill-pencil, fill-pen, ...), so it follows styles.css.
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
