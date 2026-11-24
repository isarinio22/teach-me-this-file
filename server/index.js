import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 3001 // Cloud Run sets PORT; 3001 is for local development

// The folder of this file. ES modules have no __dirname, so it is derived from the module's URL.
const serverFolder = path.dirname(fileURLToPath(import.meta.url))
const builtClient = path.join(serverFolder, '../client/dist')

app.disable('x-powered-by')

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// In production this same server also serves the built React app.
app.use(express.static(builtClient))

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
