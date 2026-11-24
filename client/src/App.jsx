import { useState } from 'react'
import Button from './components/Button.jsx'
import Settings from './components/Settings.jsx'
import SetupScreen from './screens/SetupScreen.jsx'

export default function App() {
  // The key lives only in this component's memory: no localStorage, no cookie.
  const [apiKey, setApiKey] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notice, setNotice] = useState('')

  function saveKey(key) {
    setApiKey(key)
    setSettingsOpen(false)
  }

  // Building the lesson is the next milestone. Until then the form only checks its inputs.
  function buildLesson() {
    setNotice('The file and the key are in place. Building the lesson is the next part of this app to be written.')
  }

  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-sheet px-4 pt-4">
        <div className="flex min-h-14 items-center justify-between gap-4 rounded-pill bg-sage py-1.5 ps-6 pe-1.5">
          <p className="font-bold">Teach me this file</p>
          <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
            {apiKey ? 'Change API key' : 'Add API key'}
          </Button>
        </div>
      </header>

      <SetupScreen hasKey={apiKey !== ''} onAddKey={() => setSettingsOpen(true)} onBuild={buildLesson} notice={notice} />

      {settingsOpen && <Settings apiKey={apiKey} onSave={saveKey} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
