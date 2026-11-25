import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import Button from './Button.jsx'
import { TutorAvatar } from './Drawings.jsx'

// Wide tables scroll sideways inside the note instead of stretching the page on a phone.
// `node` is react-markdown's own data about the element; it must not reach the page.
const components = { table: ({ node, ...props }) => <div className="overflow-x-auto"><table {...props} /></div> }

// Lesson text: Markdown with tables and LaTeX formulas, in whatever direction its language needs.
export function LessonText({ children, className = '' }) {
  return (
    <div dir="auto" className={`lesson-text ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

// One thing the tutor said, written on the sheet like a note, not in a chat bubble.
// Three dots that rise in turn, the way a chat shows that someone is typing.
function TypingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1.5 rounded-pill bg-desk px-4 py-3">
      {['0s', '0.15s', '0.3s'].map((delay) => (
        <span key={delay} style={{ animationDelay: delay }} className="size-2.5 rounded-pill bg-graphite motion-safe:animate-typing" />
      ))}
    </span>
  )
}

// waiting: what the student reads until the first words of a live reply arrive, under typing dots.
export default function TutorNote({ text, note, live, waiting, onShowSource }) {
  return (
    <div className="flex gap-3">
      <TutorAvatar className="size-12" />
      <div className="min-w-0 flex-1" aria-live={live ? 'polite' : undefined}>
        {text || !waiting ? (
          <LessonText className="text-lesson">{text || '…'}</LessonText>
        ) : (
          <div role="status">
            <TypingDots />
            <p dir="ltr" className="mt-2 text-graphite">{waiting}</p>
          </div>
        )}
        {note && <p className="mt-1 text-small text-graphite">{note}</p>}
        {onShowSource && <Button variant="quiet" className="text-small" onClick={onShowSource}>Show source</Button>}
      </div>
    </div>
  )
}
