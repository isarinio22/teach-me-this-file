// Server-Sent Events, and the splitter that separates the tutor's text from its JSON.
import { turnResultSchema } from './schemas.js'

// SSE is a plain HTTP response that stays open while the server writes small named messages
// into it. The browser reads them as they arrive.
export function openEventStream(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no', // asks proxies not to hold the messages back
  })
}

export function sendEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

// The tutor writes its message, then this line, then a JSON object (see prompts/tutor.md).
const DELIMITER = '@@TURN@@'
export const SPLIT_START = { held: '', json: null }

// Takes the split so far and the next chunk of the reply. Returns the new split and the text that
// is safe to show now. The delimiter can be cut across two chunks, so the end of a chunk that
// could be the start of the delimiter is held back until the next chunk shows what it is.
export function splitChunk(split, chunk) {
  if (split.json !== null) return { split: { ...split, json: split.json + chunk }, show: '' }
  const text = split.held + chunk
  const at = text.indexOf(DELIMITER)
  if (at !== -1) return { split: { held: '', json: text.slice(at + DELIMITER.length) }, show: text.slice(0, at) }
  let keep = Math.min(DELIMITER.length - 1, text.length)
  while (keep > 0 && !DELIMITER.startsWith(text.slice(text.length - keep))) keep--
  return { split: { held: text.slice(text.length - keep), json: null }, show: text.slice(0, text.length - keep) }
}

// After the last chunk: any text still held back, and the tutor's JSON if it is there and valid.
export function finishSplit(split) {
  if (split.json === null) return { show: split.held, turn: null }
  try {
    const json = JSON.parse(split.json.replace(/```(json)?/g, '').trim())
    const checked = turnResultSchema.safeParse(json)
    return { show: '', turn: checked.success ? checked.data : null }
  } catch {
    return { show: '', turn: null }
  }
}
