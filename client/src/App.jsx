import { useState } from 'react'
import Button from './components/Button.jsx'
import Settings from './components/Settings.jsx'

export default function App() {
  // The key lives only in this component's memory: no localStorage, no cookie.
  const [apiKey, setApiKey] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  function saveKey(key) {
    setApiKey(key)
    setSettingsOpen(false)
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

      {settingsOpen && <Settings apiKey={apiKey} onSave={saveKey} onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
