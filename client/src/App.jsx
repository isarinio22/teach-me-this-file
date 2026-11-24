import { useReducer, useRef, useState } from 'react'
import { buildLesson } from './api.js'
import Button from './components/Button.jsx'
import Settings from './components/Settings.jsx'
import { lessonReducer, removeStep } from './lesson.js'
import LessonScreen from './screens/LessonScreen.jsx'
import PlanScreen from './screens/PlanScreen.jsx'
import ReportScreen from './screens/ReportScreen.jsx'
import SetupScreen from './screens/SetupScreen.jsx'

export default function App() {
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
    <div className="min-h-dvh">
      <header className="mx-auto max-w-sheet px-4 pt-4">
        <div className="flex min-h-14 items-center justify-between gap-4 rounded-pill bg-sage py-1.5 ps-6 pe-1.5">
          <p className="font-bold whitespace-nowrap">Teach me this file</p>
          <Button variant="secondary" className="whitespace-nowrap" onClick={() => setSettingsOpen(true)}>
            {apiKey ? 'Change key' : 'Add API key'}
          </Button>
        </div>
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
      {screen === 'lesson' && <LessonScreen lesson={lesson} dispatch={dispatch} apiKey={apiKey} onFinish={() => setScreen('report')} />}
      {screen === 'report' && <ReportScreen lesson={lesson} onRestart={teachAnotherFile} />}

      {settingsOpen && <Settings apiKey={apiKey} onSave={saveKey} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
