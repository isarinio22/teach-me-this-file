import { useRef, useState } from 'react'
import { buildLesson } from './api.js'
import Button from './components/Button.jsx'
import Settings from './components/Settings.jsx'
import { removeStep } from './lesson.js'
import PlanScreen from './screens/PlanScreen.jsx'
import SetupScreen from './screens/SetupScreen.jsx'

export default function App() {
  // The key lives only in this component's memory: no localStorage, no cookie.
  const [apiKey, setApiKey] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [screen, setScreen] = useState('setup') // 'setup' or 'plan'
  const [file, setFile] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState(null) // while a lesson is being built: { name, backup }
  const [buildError, setBuildError] = useState(null)
  const [built, setBuilt] = useState(null) // { plan, usedBackupModel }
  const [notice, setNotice] = useState('')
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
    setNotice('')
    setScreen('plan')
  }

  function backToSetup() {
    if (!built.plan.teachable) chooseFile(null)
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
          onStart={() => setNotice('The plan is ready. The lesson screen is the next part of this app to be written.')}
          onBack={backToSetup}
          notice={notice}
        />
      )}

      {settingsOpen && <Settings apiKey={apiKey} onSave={saveKey} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
