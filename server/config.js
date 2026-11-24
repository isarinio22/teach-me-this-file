// Model IDs and limits. Every number that shapes cost or behavior is set here.

// Builds the lesson plan: one call per lesson, where quality matters most.
export const PLAN_MODEL = 'gemini-4-hydrogen'

// Takes over for one retry when PLAN_MODEL is busy or rate limited. On free keys that happens often.
export const PLAN_BACKUP_MODEL = 'gemini-3.5-flash-lite'

// The file travels to Gemini inside the request as base64, which adds a third.
// 14 MB becomes about 18.7 MB, under the 20 MB limit for inline requests.
export const MAX_FILE_BYTES = 14 * 1024 * 1024

// The largest file, in tokens, that a lesson is built from. Counted before generating anything.
// A PDF page costs about 560 tokens whatever is on it, so this is roughly 180 pages. Longer
// files make slow, costly plans that cover too much for one lesson.
export const TOKEN_BUDGET = 100_000
