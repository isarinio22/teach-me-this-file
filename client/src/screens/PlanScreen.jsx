import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import { TutorAvatar } from '../components/Drawings.jsx'
import { LessonText } from '../components/TutorNote.jsx'

// The plan as a teacher reads it: each step's goal and the question that checks it.
export default function PlanScreen({ plan, usedBackupModel, onRemoveStep, onStart, onBack }) {
  if (!plan.teachable) {
    return (
      <main className="mx-auto max-w-sheet px-4 py-8 lg:py-12">
        <div className="max-w-page rounded-sheet bg-paper p-5 shadow-sheet sm:p-8">
          <TutorAvatar className="size-24" />
          <h1 className="mt-4 text-title font-bold">This file can&rsquo;t be taught as a lesson</h1>
          <p dir="auto" className="mt-3 text-lesson">{plan.reason}</p>
          <p className="mt-3 text-graphite">A lesson needs school material: a chapter, an article, a worksheet or class notes.</p>
          <Button className="mt-6" onClick={onBack}>Choose another file</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-sheet px-4 py-8 lg:py-12">
      <h1 dir="auto" className="text-title font-bold md:text-display">{plan.title}</h1>
      <p className="mt-3 text-lesson text-graphite">
        {plan.steps.length} steps, about {plan.minutes} minutes, taught in {plan.language}.
      </p>

      <div className="mt-8 lg:flex lg:items-start lg:gap-10">
        <section aria-label="Lesson plan" className="max-w-page rounded-sheet bg-paper p-5 shadow-sheet sm:p-8 lg:flex-1">
          {usedBackupModel && (
            <div className="mb-6">
              <Alert>The main model was not available, so a backup model wrote this plan. Read the questions before you start.</Alert>
            </div>
          )}
          <ol>
            {plan.steps.map((step, index) => (
              <li key={step.id} className="border-t border-grid py-6 first:border-t-0 first:pt-0">
                <h2 dir="auto" className="text-step font-bold"><span className="text-blue">{index + 1}.</span> {step.title}</h2>
                <LessonText className="mt-2">{step.objective}</LessonText>
                <p className="mt-4 text-small text-graphite">Check question</p>
                <LessonText className="mt-1 border-s-2 border-grid ps-3 text-graphite">{step.main.stem}</LessonText>
                {plan.steps.length > 1 && (
                  <Button variant="quiet" className="mt-2" aria-label={`Remove step ${index + 1}: ${step.title}`} onClick={() => onRemoveStep(step.id)}>
                    Remove step
                  </Button>
                )}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-grid pt-8">
            <Button className="w-full sm:w-auto sm:px-10" onClick={onStart}>Start lesson</Button>
            <Button variant="quiet" onClick={onBack}>Use another file</Button>
          </div>
        </section>

        <aside className="mt-10 lg:mt-2 lg:w-margin">
          <TutorAvatar className="size-24" />
          <h2 className="mt-3 font-bold">Before you start</h2>
          <p className="mt-3 text-small text-graphite">
            Remove any step you don&rsquo;t want. Each step ends with its check question. A wrong answer gets a hint aimed at that mistake; a second one gets a new explanation and a parallel question.
          </p>
        </aside>
      </div>
    </main>
  )
}
