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
export default function TutorNote({ text, note, live, onShowSource }) {
  return (
    <div className="flex gap-3">
      <TutorAvatar className="size-12" />
      <div className="min-w-0 flex-1" aria-live={live ? 'polite' : undefined}>
        <LessonText className="text-lesson">{text || '…'}</LessonText>
        {note && <p className="mt-1 text-small text-graphite">{note}</p>}
        {onShowSource && <Button variant="quiet" className="text-small" onClick={onShowSource}>Show source</Button>}
      </div>
    </div>
  )
}
