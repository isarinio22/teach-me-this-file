import { lazy, Suspense, useEffect, useReducer, useRef, useState } from 'react'
import { buildLesson, checkServer } from './api.js'
import Alert from './components/Alert.jsx'
import Button from './components/Button.jsx'
import { DeskObjects } from './components/Drawings.jsx'
import Settings from './components/Settings.jsx'
import { lessonReducer, removeStep } from './lesson.js'
import PlanScreen from './screens/PlanScreen.jsx'
import ReportScreen from './screens/ReportScreen.jsx'
import SetupScreen from './screens/SetupScreen.jsx'

// The lesson screen carries the Markdown and math libraries, most of the app's size. It is loaded
// separately, so the first page opens fast, and fetched early, as soon as a plan is ready.
const loadLessonScreen = () => import('./screens/LessonScreen.jsx')
const LessonScreen = lazy(loadLessonScreen)

export default function App() {
  const [server, setServer] = useState('checking') // checking, slow, ready or down
  // The key lives only in this component's memory: no localStorage, no cookie.
  const [apiKey, setApiKey] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [screen, setScreen] = useState('setup') // setup, plan, lesson or report
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState(null) // while a lesson is being built: { name, backup }
  const [buildError, setBuildError] = useState(null)
  const [built, setBuilt] = useState(null) // { plan, usedBackupModel }
  // The lesson plan and the student's progress, changed only by events (see lesson.js).
  const [lesson, dispatch] = useReducer(lessonReducer, null)
  const buildController = useRef(null)

  // The server stops when nobody uses it, and the first request after that waits for it to start.
  // Waking it on page load means the teacher sees why, instead of a long silent wait.
  useEffect(() => {
    const slow = setTimeout(() => setServer((now) => (now === 'checking' ? 'slow' : now)), 2000)
    checkServer().then((ok) => {
      clearTimeout(slow)
      setServer(ok ? 'ready' : 'down')
    })
    return () => clearTimeout(slow)
  }, [])

  // A new screen starts at the top, not where the last one was scrolled to.
  useEffect(() => window.scrollTo(0, 0), [screen])

  function saveKey(key) {
    setApiKey(key)
    setSettingsOpen(false)
    setBuildError(null)
  }

  function chooseFile(chosen) {
    setFile(chosen)
    setBuildError(null)
  }

  async function build() {
    buildController.current = new AbortController()
    setBuildError(null)
    setStage({ name: 'sending' })
    const result = await buildLesson({
      file,
      prompt,
      apiKey,
      signal: buildController.current.signal,
      onStage: (name, data) => setStage({ name, backup: data.backup }),
    })
    setStage(null)
    if (result.cancelled) return
    if (result.error) return setBuildError(result.error)
    setBuilt(result)
    setScreen('plan')
    loadLessonScreen()
  }

  function backToSetup() {
    if (!built.plan.teachable) chooseFile(null)
    setScreen('setup')
  }

  function startLesson() {
    dispatch({ type: 'started', plan: built.plan, teacherPrompt: prompt, now: Date.now(), seed: Math.random() })
    setScreen('lesson')
  }

  function teachAnotherFile() {
    chooseFile(null)
    setScreen('setup')
  }

  return (
    <div className="relative min-h-dvh">
      <DeskObjects />
      <header className="mx-auto max-w-sheet px-4 pt-4">
        <div className="flex min-h-14 items-center justify-between gap-4 rounded-pill bg-sage py-1.5 ps-6 pe-1.5">
          <p className="font-bold whitespace-nowrap">Teach me this file</p>
          <Button variant="secondary" className="whitespace-nowrap" onClick={() => setSettingsOpen(true)}>
            {apiKey ? 'Change key' : 'Add API key'}
          </Button>
        </div>
        {server === 'slow' && <p role="status" className="mt-3 text-small text-graphite">Starting the server. After a quiet period this takes a few seconds.</p>}
        {server === 'down' && <div className="mt-3"><Alert tone="error">The server is not answering. Check your internet connection, then reload the page.</Alert></div>}
      </header>

      {screen === 'setup' && (
        <SetupScreen
          hasKey={apiKey !== ''}
          onAddKey={() => setSettingsOpen(true)}
          file={file}
          onFileChange={chooseFile}
          prompt={prompt}
          onPromptChange={setPrompt}
          onBuild={build}
          stage={stage}
          onCancel={() => buildController.current.abort()}
          error={buildError}
        />
      )}
      {screen === 'plan' && (
        <PlanScreen
          plan={built.plan}
          usedBackupModel={built.usedBackupModel}
          onRemoveStep={(stepId) => setBuilt({ ...built, plan: removeStep(built.plan, stepId) })}
          onStart={startLesson}
          onBack={backToSetup}
        />
      )}
      {screen === 'lesson' && (
        <Suspense fallback={<p role="status" className="mx-auto max-w-sheet px-4 py-10 text-graphite">Opening the lesson.</p>}>
          <LessonScreen lesson={lesson} dispatch={dispatch} apiKey={apiKey} onFinish={() => setScreen('report')} />
        </Suspense>
      )}
      {screen === 'report' && <ReportScreen lesson={lesson} onRestart={teachAnotherFile} />}

      {settingsOpen && <Settings apiKey={apiKey} onSave={saveKey} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
