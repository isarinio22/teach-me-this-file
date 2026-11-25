import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MAX_FILE_BYTES, PLAN_BACKUP_TRIES, PLAN_MODEL, TOKEN_BUDGET } from './config.js'
import { checkFile } from './files.js'
import { countPlanTokens, describeError, generatePlan, startTurn } from './gemini.js'
import { turnRequestSchema } from './schemas.js'
import { finishSplit, openEventStream, sendEvent, SPLIT_START, splitChunk } from './stream.js'

const app = express()
const port = process.env.PORT || 3001 // Cloud Run sets PORT; 3001 is for local development

// The folder of this file. ES modules have no __dirname, so it is derived from the module's URL.
const serverFolder = path.dirname(fileURLToPath(import.meta.url))
const builtClient = path.join(serverFolder, '../client/dist')

// Uploads are held in memory for the length of one request and never written to disk.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_BYTES, files: 1 } })

app.disable('x-powered-by')

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// Every AI route uses the visitor's own key. It is read from a header, kept for this
// request only, and never logged.
function requireKey(req, res, next) {
  const apiKey = req.get('x-api-key')?.trim()
  if (!apiKey) return res.status(401).json({ code: 'no_key', message: 'Add your Gemini API key first.' })
  res.locals.apiKey = apiKey
  next()
}

// File and prompt in, progress events out: received, reading, planning, then ready or error.
app.post('/api/lessons', requireKey, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ code: 'bad_request', message: 'Choose a file first.' })
  const check = checkFile(req.file)
  if (check.error) return res.status(415).json(check.error)

  const file = { mimeType: check.mimeType, buffer: req.file.buffer }
  const teacherPrompt = String(req.body.prompt ?? '').slice(0, 2000)
  const { apiKey } = res.locals

  // If the browser goes away (Cancel, a closed tab), the model call is stopped too.
  const abort = new AbortController()
  res.on('close', () => abort.abort())

  openEventStream(res)
  sendEvent(res, 'received', { bytes: req.file.size })
  // A comment line every 15 seconds keeps mobile networks from closing a quiet connection.
  const keepAlive = setInterval(() => res.write(': keep-alive\n\n'), 15_000)
  try {
    sendEvent(res, 'reading', {})
    const tokens = await countPlanTokens(apiKey, file, teacherPrompt, abort.signal)
    if (tokens > TOKEN_BUDGET) {
      const size = `about ${tokens.toLocaleString('en-US')} tokens, and the limit is ${TOKEN_BUDGET.toLocaleString('en-US')}`
      const message = `This file is too long for one lesson: ${size} (roughly 180 PDF pages). Upload only the chapter you want to teach.`
      sendEvent(res, 'error', { code: 'over_token_budget', message })
    } else {
      const onModel = (model, attempt = 1) => sendEvent(res, 'planning', { backup: model !== PLAN_MODEL, attempt, tries: PLAN_BACKUP_TRIES })
      const result = await generatePlan(apiKey, file, teacherPrompt, { signal: abort.signal, onModel })
      sendEvent(res, 'ready', result)
    }
  } catch (error) {
    if (!abort.signal.aborted) sendEvent(res, 'error', describeError(error, 'Google could not read this file. Export it again, or try another file.'))
  }
  clearInterval(keepAlive)
  res.end()
})

// One tutor turn: the move and its context in, the tutor's words out as they are written,
// then its JSON. If the JSON is missing or invalid the turn still counts; the lesson state
// simply does not change, and the problem is logged.
app.post('/api/turn', requireKey, express.json({ limit: '200kb' }), async (req, res) => {
  const parsed = turnRequestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ code: 'bad_request', message: 'This lesson request is not valid. Reload the page and start again.' })

  const abort = new AbortController()
  res.on('close', () => abort.abort()) // Stop in the browser closes the connection, which stops the model
  openEventStream(res)
  try {
    const { stream: reply } = await startTurn(res.locals.apiKey, parsed.data, abort.signal)
    let split = SPLIT_START
    for await (const chunk of reply) {
      const result = splitChunk(split, chunk.text ?? '')
      split = result.split
      if (result.show) sendEvent(res, 'token', { text: result.show })
    }
    const { show, turn } = finishSplit(split)
    if (show) sendEvent(res, 'token', { text: show })
    if (turn) sendEvent(res, 'turn', turn)
    else console.error(`Tutor turn without valid JSON (move: ${parsed.data.move})`)
    sendEvent(res, 'done', {})
  } catch (error) {
    if (!abort.signal.aborted) sendEvent(res, 'error', describeError(error, 'Google refused this turn. Try again.'))
  }
  res.end()
})

// In production this same server also serves the built React app.
app.use(express.static(builtClient))

// Failures before a route runs, such as an upload over the size limit.
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    const megabytes = MAX_FILE_BYTES / 1024 / 1024
    return res.status(413).json({ code: 'file_too_large', message: `This file is larger than ${megabytes} MB. Split it or export a smaller version.` })
  }
  console.error('Unexpected error:', error.message)
  res.status(500).json({ code: 'server_error', message: 'Something went wrong on the server. Try again.' })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
