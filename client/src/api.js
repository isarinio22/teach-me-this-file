// Every call to the server goes through this file.

const DROPPED = { code: 'stream_dropped', message: 'The connection to the server was lost. Check your connection and try again.' }

// Reads a Server-Sent Events response and calls onEvent(name, data) for each message.
// Messages are separated by a blank line; a network chunk can end in the middle of one.
async function readEvents(response, onEvent) {
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) return
    buffer += value
    const messages = buffer.split('\n\n')
    buffer = messages.pop() // the last piece may be incomplete, so it waits for the next chunk
    for (const message of messages) {
      const name = message.match(/^event: (.+)$/m)?.[1]
      const data = message.match(/^data: (.+)$/m)?.[1]
      if (name && data) onEvent(name, JSON.parse(data))
    }
  }
}

// Sends the file and the prompt and reports each stage through onStage(name, data).
// Resolves to { plan, usedBackupModel }, to { error }, or to { cancelled: true }.
export async function buildLesson({ file, prompt, apiKey, signal, onStage }) {
  const form = new FormData()
  form.append('prompt', prompt)
  form.append('file', file)

  let result = { error: DROPPED } // what the caller gets if the stream ends without an answer
  try {
    const response = await fetch('/api/lessons', { method: 'POST', headers: { 'x-api-key': apiKey }, body: form, signal })
    if (!response.ok) return { error: await response.json() }
    await readEvents(response, (name, data) => {
      if (name === 'ready') result = data
      else if (name === 'error') result = { error: data }
      else onStage(name, data)
    })
  } catch {
    if (signal.aborted) return { cancelled: true }
  }
  return result
}
