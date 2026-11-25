// Model IDs and limits. Every number that shapes cost or behavior is set here.
// Each model can be swapped without a code change by setting an environment variable of the
// same name, for example PLAN_MODEL=gemini-4-carbon. Model names only: the API key is never set here.

// Builds the lesson plan: one call per lesson, where quality matters most. Gemini 4 Hydrogen is the
// strongest model a free key can call, so every model the app uses can be tested on a free key.
export const PLAN_MODEL = process.env.PLAN_MODEL || 'gemini-4-hydrogen'

// Thinks little: on its default level a short PDF took two to five minutes.
export const PLAN_THINKING = 'LOW'

// How long PLAN_MODEL gets before the backup takes over. Cloud Run ends every request at 300
// seconds, so the backup still has time to finish inside that limit.
export const PLAN_DEADLINE_SECONDS = Number(process.env.PLAN_DEADLINE_SECONDS) || 120

// Takes over when PLAN_MODEL is busy, rate limited, too slow, or not open to this key, and writes
// the one repair. Flash-Lite answers fast, and on a free key it kept answering when the others were
// busy or over their limit of 20 requests a day.
export const PLAN_BACKUP_MODEL = process.env.PLAN_BACKUP_MODEL || 'gemini-3.5-flash-lite'

// Speaks on every turn of the lesson, where waiting feels bad: the strongest Flash model, thinking little.
export const TUTOR_MODEL = process.env.TUTOR_MODEL || 'gemini-3.8-flash'
export const TUTOR_THINKING = 'LOW'

// Takes over for the one retry when TUTOR_MODEL is busy before the reply starts.
export const TUTOR_BACKUP_MODEL = process.env.TUTOR_BACKUP_MODEL || 'gemini-3.5-flash-lite'

// The longest tutor turn, in tokens. A turn is meant to be under 150 words; this is a cost ceiling.
export const TUTOR_MAX_TOKENS = 700

// The file travels to Gemini inside the request as base64, which adds a third.
// 14 MB becomes about 18.7 MB, under the 20 MB limit for inline requests.
export const MAX_FILE_BYTES = 14 * 1024 * 1024

// The largest file, in tokens, that a lesson is built from. Counted before generating anything.
// A PDF page costs about 560 tokens whatever is on it, so this is roughly 180 pages. Longer
// files make slow, costly plans that cover too much for one lesson.
export const TOKEN_BUDGET = 100_000
