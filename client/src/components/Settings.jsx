import { useEffect, useRef, useState } from 'react'
import Button from './Button.jsx'

// The API key panel. It only edits a draft; App owns the real key and keeps it in memory.
export default function Settings({ apiKey, onSave, onClose }) {
  const dialog = useRef(null)
  const [draft, setDraft] = useState(apiKey)

  // A <dialog> is opened by calling a method, not by a prop. showModal() also traps
  // keyboard focus inside the panel and makes Escape close it.
  useEffect(() => {
    if (!dialog.current.open) dialog.current.showModal()
  }, [])

  function save(event) {
    event.preventDefault()
    onSave(draft.trim())
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="settings-title"
      className="mt-auto w-full max-w-none rounded-t-sheet bg-paper p-6 text-ink shadow-sheet backdrop:bg-ink/50 sm:m-auto sm:max-w-dialog sm:rounded-sheet sm:p-8"
    >
      <form onSubmit={save}>
        <h2 id="settings-title" className="text-step font-bold">Gemini API key</h2>
        <p className="mt-2 text-graphite">
          Lessons are built with Google&rsquo;s Gemini models, using your own key.
        </p>

        <label htmlFor="api-key" className="mt-6 block font-medium">API key</label>
        <input
          id="api-key"
          type="password"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="mt-2 block min-h-11 w-full rounded-field border border-graphite/70 bg-paper px-4"
        />
        <p className="mt-2 text-small text-graphite">
          Kept in this tab&rsquo;s memory only and sent with each request. It is never stored, and reloading the page forgets it.
        </p>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-11 items-center text-blue underline underline-offset-4 hover:text-ink"
        >
          Get a key in Google AI Studio
        </a>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Button type="submit">Save key</Button>
          <Button variant="quiet" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </dialog>
  )
}
