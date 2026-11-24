import { useRef, useState } from 'react'
import Alert from '../components/Alert.jsx'
import Button from '../components/Button.jsx'
import { Pencil, TutorAvatar } from '../components/Drawings.jsx'

const MAX_FILE_BYTES = 14 * 1024 * 1024 // the server enforces the same limit
const ACCEPTED_ENDINGS = '.pdf,.png,.jpg,.jpeg,.webp,.txt,.md'

const EXAMPLES = [
  { label: '7th graders, in French', prompt: 'Teach this to 7th graders, in French. Be Socratic. Keep it under 15 minutes.' },
  { label: 'Exam revision', prompt: 'Prepare 10th graders for an exam on this. Be direct and use short examples. About 20 minutes.' },
  { label: 'Five-minute recap', prompt: 'A quick recap for students who already studied this. Keep it under 5 minutes.' },
]

const METHOD = [
  'It opens by asking what the student already knows.',
  'It teaches one idea at a time.',
  'Every idea ends with a real question, never “Do you understand?”',
  'A wrong answer gets a hint aimed at the mistake, not the answer.',
  'It stays inside your file.',
]

// The server's progress events, grouped into the three stages the teacher sees.
const STAGES = [
  { events: ['sending'], label: 'Sending the file' },
  { events: ['received', 'reading'], label: 'Reading the file' },
  { events: ['planning'], label: 'Writing the lesson plan' },
]

function sizeLabel(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function BuildProgress({ stage, onCancel }) {
  const current = STAGES.findIndex((item) => item.events.includes(stage.name))
  return (
    <div className="space-y-5">
      <ol className="space-y-3" aria-live="polite">
        {STAGES.map((item, index) => (
          <li key={item.label} className={`flex items-center gap-3 ${index > current ? 'text-graphite' : 'font-medium'}`}>
            <span
              aria-hidden="true"
              className={`size-5 shrink-0 rounded-pill border-2 ${index < current ? 'border-graphite bg-graphite' : ''} ${index === current ? 'border-blue motion-safe:animate-pulse' : ''} ${index > current ? 'border-graphite/40' : ''}`}
            />
            {item.label}
            {index < current && <span className="sr-only">, done</span>}
          </li>
        ))}
      </ol>
      {stage.backup && <Alert>The main model is not available, so a faster model is writing the plan.</Alert>}
      <p className="text-small text-graphite">A short file takes under a minute; a long one can take two.</p>
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    </div>
  )
}

export default function SetupScreen({ hasKey, onAddKey, file, onFileChange, prompt, onPromptChange, onBuild, stage, onCancel, error }) {
  const [problem, setProblem] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef(null)

  function chooseFile(chosen) {
    if (!chosen) return
    if (chosen.size > MAX_FILE_BYTES) {
      onFileChange(null)
      setProblem(`“${chosen.name}” is ${sizeLabel(chosen.size)}. The limit is 14 MB. Split the file or export a smaller version.`)
      return
    }
    onFileChange(chosen)
    setProblem('')
  }

  function removeFile() {
    onFileChange(null)
    fileInput.current.value = '' // otherwise choosing the same file again would not fire onChange
  }

  function dropFile(event) {
    event.preventDefault()
    setDragging(false)
    chooseFile(event.dataTransfer.files[0])
  }

  function submit(event) {
    event.preventDefault()
    if (!file) return setProblem('Choose a file first.')
    if (!hasKey) return onAddKey() // opens the one API key panel; there is no second place to enter a key
    onBuild()
  }

  return (
    <main className="mx-auto max-w-sheet px-4 py-8 lg:py-12">
      <h1 className="text-title font-bold md:text-display">Turn a file into a lesson</h1>
      <p className="mt-3 max-w-page text-lesson text-graphite">
        Upload school material and say how it should be taught. The tutor teaches it one step at a time and checks every step with a question.
      </p>

      <div className="mt-8 lg:flex lg:items-start lg:gap-10">
        <form onSubmit={submit} className="relative max-w-page rounded-sheet bg-paper p-5 shadow-sheet sm:p-8 lg:flex-1">
          <Pencil className="absolute end-6 -top-3 w-36 -rotate-12 sm:w-44" />
          <fieldset disabled={Boolean(stage)}>
            <section>
              <h2 id="file-heading" className="text-step font-bold"><span className="text-blue">1.</span> The file</h2>
              <div
                onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={dropFile}
                className={`mt-4 rounded-field border border-blue p-4 ${file ? '' : 'border-dashed'} ${dragging ? 'bg-blue/10' : 'bg-desk'}`}
              >
                <input ref={fileInput} type="file" hidden accept={ACCEPTED_ENDINGS} onChange={(event) => chooseFile(event.target.files[0])} />
                {file ? (
                  <div className="flex flex-wrap items-center justify-between gap-x-4">
                    <p className="min-w-0">
                      <span dir="auto" className="block font-medium break-words">{file.name}</span>
                      <span className="block text-small text-graphite">{sizeLabel(file.size)}</span>
                    </p>
                    <Button variant="quiet" onClick={removeFile}>Remove file</Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Button variant="secondary" aria-describedby="file-heading" onClick={() => fileInput.current.click()}>Choose a file</Button>
                    <p className="text-small text-graphite">PDF, PNG, JPEG, WEBP, TXT or MD, up to 14 MB.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8 border-t border-grid pt-8">
              <h2 className="text-step font-bold">
                <label htmlFor="prompt"><span className="text-blue">2.</span> How to teach it</label>
              </h2>
              <p id="prompt-hint" className="mt-2 text-graphite">
                Say who the students are, and the language, tone and length you want. Left empty, the lesson uses the file&rsquo;s language and takes about 15 minutes.
              </p>
              <textarea
                id="prompt"
                dir="auto"
                rows={4}
                value={prompt}
                onChange={(event) => onPromptChange(event.target.value)}
                aria-describedby="prompt-hint"
                className="mt-4 block w-full rounded-field border border-graphite/70 bg-paper p-4"
              />
              <p className="mt-4 text-small text-graphite">Start from an example:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <Button key={example.label} variant="secondary" className="text-small" onClick={() => onPromptChange(example.prompt)}>
                    {example.label}
                  </Button>
                ))}
              </div>
            </section>
          </fieldset>

          <div className="mt-8 space-y-5 border-t border-grid pt-8">
            {problem && <Alert tone="error">{problem}</Alert>}
            {error && !stage && <Alert tone="error">{error.message}</Alert>}
            {stage ? (
              <BuildProgress stage={stage} onCancel={onCancel} />
            ) : (
              <Button type="submit" className="w-full sm:w-auto sm:px-10">Build lesson</Button>
            )}
            <p className="text-small text-graphite">
              Your file is sent to Google&rsquo;s Gemini API to build the lesson. This server does not keep it.
            </p>
          </div>
        </form>

        <aside className="mt-10 lg:mt-2 lg:w-margin">
          <TutorAvatar className="size-14" />
          <h2 className="mt-3 font-bold">How the lesson goes</h2>
          <ol className="mt-3 space-y-3 text-small text-graphite">
            {METHOD.map((line) => <li key={line}>{line}</li>)}
          </ol>
        </aside>
      </div>
    </main>
  )
}
