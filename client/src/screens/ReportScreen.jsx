import Button from '../components/Button.jsx'
import { TutorAvatar } from '../components/Drawings.jsx'
import { OUTCOME_LABELS, OutcomeMark } from '../components/LessonPath.jsx'

// What a teacher wants to know the next morning: how each step went and which wrong ideas showed up.
export default function ReportScreen({ lesson, onRestart }) {
  const { plan, outcomes } = lesson
  const firstTry = plan.steps.filter((step) => outcomes[step.id] === 'first_try').length
  const minutes = Math.max(1, Math.round((Date.now() - lesson.startedAt) / 60000))
  const reviewed = lesson.review?.results ?? {}
  const seen = new Set()
  const caught = lesson.misconceptions.filter(({ stepId, text }) => text && !seen.has(stepId + text) && seen.add(stepId + text))

  return (
    <main className="mx-auto max-w-sheet px-4 py-8 lg:py-12">
      <h1 className="text-title font-bold md:text-display">Lesson report</h1>
      <p className="mt-3 text-lesson text-graphite">
        <span dir="auto">{plan.title}</span>. {firstTry} of {plan.steps.length} steps right on the first try, in about {minutes} minutes.
      </p>

      <div className="mt-8 lg:flex lg:items-start lg:gap-10">
        <section className="max-w-page rounded-sheet bg-paper p-5 shadow-sheet sm:p-8 lg:flex-1">
          <h2 className="text-step font-bold">Each step</h2>
          <ol className="mt-4">
            {plan.steps.map((step, index) => (
              <li key={step.id} className="flex items-start gap-3 border-t border-grid py-4 first:border-t-0">
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-pill border-2 font-medium ${outcomes[step.id] === 'needs_review' ? 'border-pen text-pen' : 'border-grid'}`}>
                  {outcomes[step.id] && outcomes[step.id] !== 'needs_review' ? <OutcomeMark outcome={outcomes[step.id]} /> : index + 1}
                </span>
                <div>
                  <p dir="auto" className="font-medium">{step.title}</p>
                  <p className="text-small text-graphite">
                    {OUTCOME_LABELS[outcomes[step.id]] ?? 'Not reached'}
                    {step.id in reviewed && `. Asked again at the end: ${reviewed[step.id] ? 'right' : 'still wrong'}.`}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <h2 className="mt-8 border-t border-grid pt-8 text-step font-bold">Misconceptions caught</h2>
          {caught.length ? (
            <ul className="mt-4 space-y-3">
              {caught.map(({ stepId, text }) => (
                <li key={stepId + text} className="border-s-4 border-pen ps-3">
                  <p dir="auto">{text}</p>
                  <p dir="auto" className="text-small text-graphite">Step {plan.steps.findIndex((step) => step.id === stepId) + 1}: {plan.steps.find((step) => step.id === stepId).title}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-graphite">None. Every answer was right on the first try.</p>
          )}

          <Button className="mt-8 w-full sm:w-auto sm:px-10" onClick={onRestart}>Teach another file</Button>
        </section>

        <aside className="mt-10 lg:mt-2 lg:w-margin">
          <TutorAvatar className="size-14" />
          <h2 className="mt-3 font-bold">For the next lesson</h2>
          <p className="mt-3 text-small text-graphite">
            Start from the steps that needed a second explanation or a review, and from the wrong ideas listed here. Each one is the specific belief the student showed when choosing an answer.
          </p>
        </aside>
      </div>
    </main>
  )
}
