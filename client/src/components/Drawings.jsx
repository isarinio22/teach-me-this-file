// The tutor's portrait and the drawings on the page. All decoration: screen readers skip them.
import tutorPortrait from './tutor.webp'

// The tutor is the app's author: a photo cut out and set in ink on the sage circle.
// One prepared 256px image, so nothing is composed in the browser.
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

// A spiral notebook with an elastic band, seen from above.
function Notebook({ className }) {
  const rings = [22, 40, 58, 76, 94, 112, 130, 148, 166, 184]
  return (
    <svg viewBox="0 0 170 210" className={className}>
      <rect x="26" y="12" width="136" height="190" rx="9" strokeWidth="2" className="fill-paper stroke-grid" />
      <rect x="20" y="8" width="136" height="190" rx="9" className="fill-blue" />
      <rect x="58" y="44" width="76" height="40" rx="5" className="fill-paper" />
      <path d="M68 58 h56 M68 70 h40" strokeWidth="3" strokeLinecap="round" className="stroke-grid" />
      <rect x="132" y="8" width="7" height="190" className="fill-pen/85" />
      {rings.map((y) => <path key={y} d={`M10 ${y} q10 -8 18 0`} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-graphite" />)}
    </svg>
  )
}

// Three books lying on top of each other, seen from the side.
function BookStack({ className }) {
  const pages = (x, y, width) => <path d={`M${x} ${y} h${width} M${x} ${y + 6} h${width} M${x} ${y + 12} h${width}`} strokeWidth="2" className="stroke-grid" />
  return (
    <svg viewBox="0 0 230 150" className={className}>
      <rect x="8" y="104" width="214" height="38" rx="5" className="fill-ink" />
      <rect x="150" y="110" width="66" height="26" rx="2" className="fill-paper" />
      {pages(154, 117, 58)}
      <rect x="30" y="110" width="8" height="26" className="fill-pencil" />
      <rect x="24" y="68" width="186" height="36" rx="5" className="fill-pen" />
      <rect x="24" y="74" width="60" height="24" rx="2" className="fill-paper" />
      {pages(28, 80, 52)}
      <rect x="14" y="36" width="196" height="32" rx="5" strokeWidth="2" className="fill-sage stroke-graphite/25" />
      <rect x="140" y="41" width="64" height="22" rx="2" className="fill-paper" />
      {pages(144, 47, 56)}
      <path d="M40 46 h70 M40 56 h46" strokeWidth="3" strokeLinecap="round" className="stroke-ink/45" />
    </svg>
  )
}

// An open book, seen from above, with a teacher's tick on the right page.
function OpenBook({ className }) {
  const lines = ['M32 36 Q66 28 104 36', 'M32 52 Q66 44 104 52', 'M32 68 Q66 60 104 68', 'M32 84 Q66 76 92 82', 'M32 100 Q66 92 104 100', 'M136 36 Q174 28 208 36', 'M136 52 Q174 44 208 52', 'M136 68 Q174 60 196 66']
  return (
    <svg viewBox="0 0 240 150" className={className}>
      <path d="M10 26 Q60 14 120 26 Q180 14 230 26 L230 142 Q180 130 120 142 Q60 130 10 142 Z" className="fill-blue" />
      <path d="M18 18 Q66 6 118 20 L118 132 Q66 120 18 130 Z" className="fill-paper" />
      <path d="M122 20 Q174 6 222 18 L222 130 Q174 120 122 132 Z" className="fill-paper" />
      <path d="M120 20 V134" strokeWidth="3" className="stroke-grid" />
      {lines.map((d) => <path key={d} d={d} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-grid" />)}
      <path d="M142 86 l12 12 l20 -24" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="stroke-pen" />
    </svg>
  )
}

// Notebooks and books lying on the graph-paper desk beside the sheet. Only on wide screens,
// where there is room beside the content; behind everything, and ignored by screen readers.
export function DeskObjects() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden xl:block">
      <div className="relative mx-auto h-full max-w-sheet">
        <Notebook className="absolute -right-36 top-36 w-32 rotate-6" />
        <BookStack className="absolute -left-40 top-128 w-36 -rotate-3" />
        <OpenBook className="absolute -right-38 top-200 w-36 -rotate-6" />
      </div>
    </div>
  )
}
