// Model IDs and limits. Every number that shapes cost or behavior is set here.

// Builds the lesson plan: one call per lesson, where quality matters most. Gemini 4 Neon is a
// frontier model that Google describes as fast; from December 2026 it is also cheaper than Carbon.
export const PLAN_MODEL = 'gemini-4-neon'

// Takes over for the one retry when PLAN_MODEL is busy, rate limited, or not open to this key
// (Gemini 4 is paid only, so a free key gets a plan from this model instead of an error).
export const PLAN_BACKUP_MODEL = 'gemini-3.8-flash'

// Speaks on every turn of the lesson, where waiting feels bad: the strongest Flash model, thinking little.
export const TUTOR_MODEL = 'gemini-3.8-flash'
export const TUTOR_THINKING = 'LOW'

// Takes over for the one retry when TUTOR_MODEL is busy before the reply starts.
export const TUTOR_BACKUP_MODEL = 'gemini-3.5-flash-lite'

// The longest tutor turn, in tokens. A turn is meant to be under 150 words; this is a cost ceiling.
export const TUTOR_MAX_TOKENS = 700

// The file travels to Gemini inside the request as base64, which adds a third.
// 14 MB becomes about 18.7 MB, under the 20 MB limit for inline requests.
export const MAX_FILE_BYTES = 14 * 1024 * 1024

// The largest file, in tokens, that a lesson is built from. Counted before generating anything.
// A PDF page costs about 560 tokens whatever is on it, so this is roughly 180 pages. Longer
// files make slow, costly plans that cover too much for one lesson.
export const TOKEN_BUDGET = 100_000
