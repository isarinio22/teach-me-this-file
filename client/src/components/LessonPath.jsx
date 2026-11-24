export const OUTCOME_LABELS = {
  first_try: 'Right on the first try',
  after_hint: 'Right after a hint',
  after_reteach: 'Right after a second explanation',
  needs_review: 'Needs review',
}

// The teacher's pen mark for a step: a tick, with one dot per wrong answer before the right one.
export function OutcomeMark({ outcome }) {
  const dots = { after_hint: [17], after_reteach: [15, 21] }[outcome] ?? []
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path d="M3 12 L8 17 L16 6" pathLength="1" strokeDasharray="1" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-pen motion-safe:animate-draw" />
      {dots.map((x) => <circle key={x} cx={x} cy="18" r="1.8" className="fill-pen" />)}
    </svg>
  )
}

// The lesson as a row of numbered steps, each marked with how it went.
export default function LessonPath({ steps, currentIndex, outcomes, label }) {
  return (
    <nav aria-label="Lesson progress">
      <p className="font-bold">{label}</p>
      <ol className="mt-3 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const outcome = outcomes[step.id]
          const current = index === currentIndex
          const state = outcome ? OUTCOME_LABELS[outcome] : current ? 'current step' : 'not started'
          const look = current
            ? 'border-blue bg-blue text-paper'
            : outcome === 'needs_review' ? 'border-pen bg-paper text-pen' : outcome ? 'border-grid bg-paper' : 'border-grid bg-desk text-graphite'
          return (
            <li key={step.id} aria-current={current ? 'step' : undefined} className={`flex size-10 items-center justify-center rounded-pill border-2 font-medium ${look}`}>
              {outcome && outcome !== 'needs_review' && !current ? <OutcomeMark outcome={outcome} /> : index + 1}
              <span className="sr-only">: {step.title}, {state}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
