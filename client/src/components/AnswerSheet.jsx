import { useState } from 'react'
import Button from './Button.jsx'

const MARK_LABELS = { right: 'your answer, right', wrong: 'your answer, wrong', answer: 'the right answer' }

// A teacher's pen mark, drawn as a line. pathLength="1" lets one animation draw any shape.
function PenMark({ wrong }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 shrink-0">
      <path d={wrong ? 'M5 5 L19 19 M19 5 L5 19' : 'M4 13 L10 19 L21 5'} pathLength="1" strokeDasharray="1" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-pen motion-safe:animate-draw" />
    </svg>
  )
}

// The check question, drawn like a psychometric answer sheet: numbered bubbles filled in pencil,
// then marked in red pen. marks: { optionIndex: 'right' | 'wrong' | 'answer' }.
export default function AnswerSheet({ item, order, marks, disabled, done, onCheck }) {
  const [selected, setSelected] = useState(null)

  function check(event) {
    event.preventDefault()
    onCheck(selected)
    setSelected(null)
  }

  return (
    <form onSubmit={check} className="rounded-field border-2 border-blue/30 bg-desk p-4 sm:p-5">
      <fieldset disabled={disabled}>
        <legend className="text-small text-graphite">Answer sheet</legend>
        <p dir="auto" className="mt-1 text-lesson font-medium">{item.stem}</p>
        <div className="mt-4 space-y-2">
          {order.map((index, position) => {
            const mark = marks[index]
            const filled = selected === index || mark === 'right' || mark === 'wrong'
            return (
              <label key={index} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-field p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-blue">
                <input type="radio" name="answer" className="sr-only" checked={selected === index} disabled={Boolean(mark) || done} onChange={() => setSelected(index)} />
                <span
                  aria-hidden="true"
                  className={`flex size-9 shrink-0 items-center justify-center rounded-pill border-2 font-medium ${filled ? 'border-graphite bg-graphite text-paper motion-safe:animate-fill' : 'border-graphite/60 bg-paper'} ${mark === 'answer' ? 'outline-2 outline-offset-2 outline-pen' : ''}`}
                >
                  {position + 1}
                </span>
                <span dir="auto" className={`flex-1 ${mark === 'wrong' ? 'text-graphite line-through decoration-pen decoration-2' : ''}`}>{item.options[index].text}</span>
                {mark && <PenMark wrong={mark === 'wrong'} />}
                {mark && <span className="sr-only">, {MARK_LABELS[mark]}</span>}
              </label>
            )
          })}
        </div>
        {!done && <Button type="submit" className="mt-4" disabled={selected === null}>Check answer</Button>}
      </fieldset>
    </form>
  )
}
