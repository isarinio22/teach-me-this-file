import { useEffect, useRef } from 'react'
import Button from './Button.jsx'
import { LessonText } from './TutorNote.jsx'

function Passages({ passages }) {
  return (
    <div className="space-y-5">
      {passages.map((passage) => (
        <figure key={passage.id} className="border-s-4 border-pencil ps-3">
          <figcaption className="text-small text-graphite">From the file, page {passage.page}</figcaption>
          <LessonText className="mt-1 text-small">{passage.text}</LessonText>
        </figure>
      ))}
    </div>
  )
}

// The passages behind a tutor note: a margin column on wide screens, a bottom sheet on phones.
export default function SourceNote({ passages, asSheet, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    if (asSheet && !dialog.current.open) dialog.current.showModal()
  }, [asSheet])

  if (!asSheet) {
    return (
      <>
        <h2 className="font-bold">Source</h2>
        <div className="mt-3"><Passages passages={passages} /></div>
      </>
    )
  }
  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="source-title"
      className="mt-auto max-h-[80dvh] w-full max-w-none rounded-t-sheet bg-paper p-6 text-ink shadow-sheet backdrop:bg-ink/50"
    >
      <h2 id="source-title" className="font-bold">Source</h2>
      <div className="mt-3"><Passages passages={passages} /></div>
      <Button variant="secondary" className="mt-6" onClick={onClose}>Close</Button>
    </dialog>
  )
}
