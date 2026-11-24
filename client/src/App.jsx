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
      <header className="border-b border-rule">
        <div className="mx-auto flex min-h-14 max-w-sheet items-center justify-between gap-4 px-4">
          <p className="font-bold">Teach me this file</p>
          <Button variant="quiet" onClick={() => setSettingsOpen(true)}>
            {apiKey ? 'Change API key' : 'Add API key'}
          </Button>
        </div>
      </header>

      <SetupScreen hasKey={apiKey !== ''} onAddKey={() => setSettingsOpen(true)} onBuild={buildLesson} notice={notice} />

      {settingsOpen && <Settings apiKey={apiKey} onSave={saveKey} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
