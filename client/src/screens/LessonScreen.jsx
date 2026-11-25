import { useEffect, useRef, useState } from 'react'
import { streamTurn } from '../api.js'
import Alert from '../components/Alert.jsx'
import AnswerSheet from '../components/AnswerSheet.jsx'
import Button from '../components/Button.jsx'
import LessonPath from '../components/LessonPath.jsx'
import { HINTS, HowItWorks, SLOW_NOTE, WAITING } from '../components/LessonGuide.jsx'
import SourceNote from '../components/SourceNote.jsx'
import TutorNote from '../components/TutorNote.jsx'
import { currentItem, currentStep, nextMove, optionOrder, section, turnRequest } from '../lesson.js'

const WIDE_SCREEN = '(min-width: 64rem)' // where the sources sit in the margin instead of a bottom sheet
// Lessons in these languages read from the right: tutor notes, answers and the answer sheet.
const RIGHT_TO_LEFT = /hebrew|arabic|persian|farsi|urdu|yiddish|עברית|عربي/i

export default function LessonScreen({ lesson, dispatch, apiKey, onFinish }) {
  const [live, setLive] = useState(null) // the tutor's reply while it streams in: { text }
  const [failure, setFailure] = useState(null) // { error, text } when a turn failed; Retry repeats it
  const [draft, setDraft] = useState('')
  const [picked, setPicked] = useState(null) // { section, ids }: the note whose sources are shown
  const [sheetOpen, setSheetOpen] = useState(false)
  const [rereadIndex, setRereadIndex] = useState(null) // a finished step, opened again from the path to read
  const [slow, setSlow] = useState(false) // the reply has not started after 8 seconds
  const controller = useRef(null)
  const liveNote = useRef(null)

  const move = nextMove(lesson)
  const step = currentStep(lesson)
  const item = currentItem(lesson)
  const here = section(lesson)
  const steps = lesson.plan.steps
  const reread = rereadIndex === null ? null : steps[rereadIndex]
  const viewed = reread ? reread.id : here // the part of the lesson on screen
  const shown = lesson.messages.filter((message) => message.section === viewed || (reread && message.section === `review-${reread.id}`))
  const busy = Boolean(live || move || failure)

  // Whenever the lesson needs the tutor, one turn runs. The ref stops a second one from starting.
  useEffect(() => {
    if (move && !controller.current && !failure) runTurn(move)
  }, [move, failure])

  useEffect(() => {
    if (live && live.text === '') liveNote.current?.scrollIntoView({ block: 'nearest' })
  }, [live])

  const silent = live?.text === ''
  useEffect(() => {
    setSlow(false)
    if (!silent) return
    const timer = setTimeout(() => setSlow(true), 8000)
    return () => clearTimeout(timer)
  }, [silent])

  async function runTurn(move) {
    controller.current = new AbortController()
    setLive({ text: '' })
    const result = await streamTurn({
      request: turnRequest(lesson, move, Date.now()),
      apiKey,
      signal: controller.current.signal,
      onText: (text) => setLive({ text }),
    })
    controller.current = null
    setLive(null)
    if (result.error) return setFailure({ error: result.error, text: result.text })
    dispatch({ type: 'tutor_replied', text: result.text.trim(), turn: result.turn ?? null, stopped: Boolean(result.stopped) })
  }

  function showSource(ids) {
    setPicked({ section: viewed, ids })
    if (!window.matchMedia(WIDE_SCREEN).matches) setSheetOpen(true)
  }

  function send(event) {
    event.preventDefault()
    if (!draft.trim()) return
    dispatch({ type: 'message_typed', text: draft.trim() })
    setDraft('')
  }

  const latestCited = shown.findLast((message) => message.role === 'tutor' && message.passageIds.length)?.passageIds
  const sourceIds = picked?.section === viewed ? picked.ids : latestCited ?? (reread ?? step).passageIds
  const sources = lesson.plan.passages.filter((passage) => sourceIds.includes(passage.id))

  const marks = Object.fromEntries(lesson.crossedOut.map((index) => [index, 'wrong']))
  if (lesson.lastAnswer?.correct) marks[lesson.lastAnswer.optionIndex] = 'right'
  else if (lesson.phase === 'answered') marks[item.options.findIndex((option) => option.correct)] = 'answer'

  const review = lesson.review
  const label = reread ? `Step ${rereadIndex + 1} of ${steps.length}, done` : here === 'end' ? `All ${steps.length} steps done` : review ? `Review ${review.index + 1} of ${review.stepIds.length}` : `Step ${lesson.stepIndex + 1} of ${steps.length}`
  const heading = reread ? reread.title : here === 'end' ? 'Wrapping up' : review ? `Review: ${step.title}` : step.title
  const moreSteps = review ? review.index + 1 < review.stepIds.length : lesson.stepIndex + 1 < steps.length
  const nextLabel = !moreSteps ? 'Continue' : review ? 'Next question' : 'Next step'
  const idle = !busy && !reread // the student's turn, on the current step
  const canWrite = idle && !['closing', 'finished'].includes(lesson.phase)
  const hint = idle && HINTS[lesson.phase]
  const direction = RIGHT_TO_LEFT.test(lesson.plan.language) ? 'rtl' : 'ltr'
  const waiting = lesson.waitingFor === 'message' ? WAITING.respond : WAITING[move]

  // The answer sheet sits where its question was asked: the replies to an answer come below it, in view.
  const sheetShown = !reread && ['checking', 'answered'].includes(lesson.phase)
  const firstAnswer = shown.findIndex((message) => message.choice === lesson.itemKind)
  const split = sheetShown && firstAnswer !== -1 ? firstAnswer : shown.length
  const showMessage = (message, index) =>
    message.role === 'tutor' ? (
      <TutorNote key={index} text={message.text} note={message.stopped ? 'Stopped' : ''} onShowSource={message.passageIds.length ? () => showSource(message.passageIds) : null} />
    ) : (
      <div key={index} className="flex justify-end ps-10 sm:ps-20">
        <p dir="auto" className="rounded-field bg-desk px-4 py-2">
          {message.choice && <span className="block text-small text-graphite">Your answer</span>}
          {message.text}
        </p>
      </div>
    )
  const reply = !reread && (
    <>
      {live && <div ref={liveNote}><TutorNote text={live.text} live waiting={waiting} note={slow ? SLOW_NOTE : ''} /></div>}
      {failure && (
        <div className="space-y-3">
          {failure.text && <TutorNote text={failure.text} note="Interrupted" />}
          <Alert tone="error">{failure.error.message}</Alert>
          <Button variant="secondary" onClick={() => setFailure(null)}>Retry</Button>
        </div>
      )}
    </>
  )

  return (
    <main className="mx-auto max-w-sheet px-4 py-6 lg:py-10">
      <LessonPath steps={steps} currentIndex={here === 'end' ? -1 : lesson.stepIndex} outcomes={lesson.outcomes} label={label} onOpen={setRereadIndex} />

      <div className="mt-6 lg:flex lg:items-start lg:gap-10">
        <section aria-label="Lesson" className="max-w-page rounded-sheet bg-paper p-5 shadow-sheet sm:p-8 lg:flex-1">
          {lesson.phase === 'opening' && !reread && <HowItWorks />}
          <h1 dir="auto" className="text-step font-bold">{heading}</h1>
          <div dir={direction} className="mt-6 space-y-6">
            {shown.slice(0, split).map(showMessage)}
            {split === shown.length && reply}
            {sheetShown && (
              <AnswerSheet
                key={`${here}-${lesson.itemKind}`}
                item={item}
                order={optionOrder(lesson)}
                marks={marks}
                disabled={busy}
                done={lesson.phase === 'answered'}
                onCheck={(optionIndex) => dispatch({ type: 'option_chosen', optionIndex })}
              />
            )}
            {shown.slice(split).map((message, index) => showMessage(message, split + index))}
            {split < shown.length && reply}
          </div>

          <div className="mt-8 space-y-4 border-t border-grid pt-6">
            {reread && <Button onClick={() => setRereadIndex(null)}>Back to the lesson</Button>}
            {hint && <p className="text-small text-graphite">{hint}</p>}
            {live && !reread && <Button variant="secondary" onClick={() => controller.current?.abort()}>Stop</Button>}
            {idle && lesson.phase === 'teaching' && <Button onClick={() => dispatch({ type: 'check_requested' })}>I&rsquo;m ready for the question</Button>}
            {idle && lesson.phase === 'answered' && <Button onClick={() => dispatch({ type: 'continued' })}>{nextLabel}</Button>}
            {idle && lesson.phase === 'finished' && <Button onClick={onFinish}>See the report</Button>}
            {canWrite && (
              <form onSubmit={send}>
                <label htmlFor="message" className="block font-medium">{lesson.phase === 'opening' ? 'Your answer' : 'Ask the tutor a question'}</label>
                <div className="mt-2 flex items-end gap-2">
                  <textarea id="message" dir="auto" rows={2} maxLength={1000} value={draft} onChange={(event) => setDraft(event.target.value)} className="block min-w-0 flex-1 rounded-field border border-graphite/70 bg-paper p-3" />
                  <Button type="submit" variant="secondary">Send</Button>
                </div>
              </form>
            )}
            {!reread && lesson.phase !== 'finished' && (
              <Button variant="quiet" className="text-small" onClick={() => { controller.current?.abort(); onFinish() }}>
                End the lesson and see the report
              </Button>
            )}
          </div>
        </section>

        {here !== 'end' && sources.length > 0 && (
          <aside className="hidden lg:sticky lg:top-6 lg:block lg:w-margin">
            <SourceNote passages={sources} />
          </aside>
        )}
      </div>

      {sheetOpen && <SourceNote passages={sources} asSheet onClose={() => setSheetOpen(false)} />}
    </main>
  )
}
