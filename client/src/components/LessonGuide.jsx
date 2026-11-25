// The words that tell the student what is happening and what to do next, kept in one place.

// What to do now, for the moments when the next action is the student's to find.
export const HINTS = {
  opening: 'Answer the tutor’s question below, then press Send.',
  teaching: 'Read the explanation. If something is unclear, ask the tutor below. When you’re ready, press “I’m ready for the question”.',
}

// What the student reads while a reply has not started yet, so a wait is never a blank screen.
export const WAITING = {
  open: 'The tutor is typing…',
  teach: 'The tutor is typing the explanation for this step…',
  hint: 'Not quite. The tutor is typing you a hint…',
  reteach: 'Not yet. The tutor is typing another way to explain it…',
  reveal: 'The tutor is typing the answer, and why…',
  confirm: 'Right! The tutor is typing why…',
  respond: 'The tutor is typing a reply…',
  recap: 'The tutor is typing a review of a step…',
  wrap_up: 'The tutor is typing the end of the lesson…',
}
export const SLOW_NOTE = 'Google is slow right now. The app keeps trying for up to a minute.'

// Shown at the start, so the student knows the order of things before the first question.
export function HowItWorks() {
  return (
    <div className="mb-6 border-b border-grid pb-6 text-small text-graphite">
      <h2 className="font-bold text-ink">How this lesson works</h2>
      <ol className="mt-2 list-decimal space-y-1 ps-5">
        <li>The tutor asks what you already know. Answer in your own words; there are no wrong answers here.</li>
        <li>Each step teaches one idea. Read it, ask the tutor anything, then answer one question about it.</li>
        <li>A wrong answer gets a hint and another try.</li>
        <li>At the end, the steps you found hardest come back, and you see a report.</li>
      </ol>
      <p className="mt-2">Steps open in order. Tap a finished step to read it again.</p>
    </div>
  )
}
