// Model IDs and limits. Every number that shapes cost or behavior is set here.
// Each model can be swapped without a code change by setting an environment variable of the
// same name, for example PLAN_MODEL=gemini-4-carbon. Model names only: the API key is never set here.

// Builds the lesson plan: one call per lesson, where quality matters most. Gemini 4 Hydrogen is the
// strongest model a free key can call, so every model the app uses can be tested on a free key.
export const PLAN_MODEL = process.env.PLAN_MODEL || 'gemini-4-hydrogen'

// Every plan model thinks little. At its default level Hydrogen took two to five minutes on a short
// PDF, and Gemini 3.5 Flash took 38 seconds where it took 24 at the low level.
export const PLAN_THINKING = 'LOW'

// How long PLAN_MODEL gets before the backup takes over. At low thinking it planned a 92-page PDF in
// 35 seconds; on a free key it can also accept a request and then stall, so it is not waited for long.
export const PLAN_DEADLINE_SECONDS = Number(process.env.PLAN_DEADLINE_SECONDS) || 50

// Take turns when PLAN_MODEL is busy, rate limited, too slow, or not open to this key, and write the
// one repair. Two models, because on a free key one is often busy while another answers: on
// 25 November both Flash-Lite models answered "busy" while Gemini 3.5 Flash wrote a plan. Flash-Lite
// goes first because, when it is free, it writes a plan in about ten seconds. To change them, set
// PLAN_BACKUP_MODELS to a comma-separated list.
export const PLAN_BACKUP_MODELS = (process.env.PLAN_BACKUP_MODELS || 'gemini-3.5-flash-lite,gemini-3.5-flash').split(',')

// Tries across the backups. A busy backup hands over to the next one at once; after each full round
// the app waits, 5 seconds after the first round and 10 after the second.
export const PLAN_BACKUP_TRIES = 6
export const PLAN_RETRY_WAIT_SECONDS = Number(process.env.PLAN_RETRY_WAIT_SECONDS) || 5

// A build that is still waiting for Google after this long stops with a clear message, before
// Cloud Run cuts the connection at 300 seconds.
export const PLAN_TOTAL_SECONDS = 240

// Speaks on every turn of the lesson, where waiting feels bad: the strongest Flash model.
export const TUTOR_MODEL = process.env.TUTOR_MODEL || 'gemini-3.8-flash'

// Take over, in this order, when the model before them is busy before the reply starts.
export const TUTOR_BACKUP_MODELS = (process.env.TUTOR_BACKUP_MODELS || 'gemini-3.5-flash-lite,gemini-3.5-flash').split(',')

// Every tutor model thinks little, for speed.
export const TUTOR_THINKING = 'LOW'

// How long each tutor model gets to start its reply before the next one is asked. Measured on a free
// key: replies start in 2 to 5 seconds, but on a phone two turns got no reply for 3 and 5 minutes.
export const TUTOR_START_SECONDS = Number(process.env.TUTOR_START_SECONDS) || 20

// The longest tutor turn, in tokens. A turn is meant to be under 150 words; this is a cost ceiling.
// The model's thinking counts against it too, and Hebrew or Arabic needs more tokens per word.
export const TUTOR_MAX_TOKENS = 1500

// The file travels to Gemini inside the request as base64, which adds a third.
// 14 MB becomes about 18.7 MB, under the 20 MB limit for inline requests.
export const MAX_FILE_BYTES = 14 * 1024 * 1024

// The largest file, in tokens, that a lesson is built from. Counted before generating anything.
// A PDF page costs about 560 tokens whatever is on it, so this is roughly 180 pages. Longer
// files make slow, costly plans that cover too much for one lesson.
export const TOKEN_BUDGET = 100_000
