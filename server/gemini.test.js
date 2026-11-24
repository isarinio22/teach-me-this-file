import { beforeEach, expect, test, vi } from 'vitest'

// The real SDK is replaced by a script: every call to the model takes the next scripted
// reply. A reply is either the text the model returns or an error it throws.
const script = vi.hoisted(() => ({ replies: [], modelsCalled: [] }))

vi.mock('@google/genai', () => {
  class ApiError extends Error {
    constructor({ message, status }) {
      super(message)
      this.status = status
    }
  }
  function GoogleGenAI() {
    return {
      models: {
        async generateContent(request) {
          script.modelsCalled.push(request.model)
          const reply = script.replies.shift()
          if (reply instanceof Error) throw reply
          return { text: reply }
        },
      },
    }
  }
  return { ApiError, GoogleGenAI }
})

const { ApiError } = await import('@google/genai')
const { PLAN_BACKUP_MODEL, PLAN_MODEL } = await import('./config.js')
const { describeError, generatePlan } = await import('./gemini.js')
const { lessonPlanSchema } = await import('./schemas.js')

function question(correctIndex = 1) {
  const options = ['From the soil', 'From the air', 'From water'].map((text, index) => ({
    text,
    correct: index === correctIndex,
    misconception: index === correctIndex ? '' : `Thinks that mass comes ${text.toLowerCase()}`,
  }))
  return { stem: 'Where does most of a plant’s mass come from?', options, explanation: 'Carbon dioxide from the air.' }
}

function validPlan() {
  const steps = [1, 2, 3, 4].map((n) => ({
    id: `s${n}`,
    title: `Step ${n}`,
    objective: 'Explain one idea',
    passageIds: ['p1'],
    main: question(),
    parallel: question(0),
  }))
  return { teachable: true, reason: '', title: 'Photosynthesis', language: 'English', minutes: 15, passages: [{ id: 'p1', page: 1, text: 'A passage.' }], steps }
}

const file = { mimeType: 'text/plain', buffer: Buffer.from('Plants make glucose.') }
const busy = () => new ApiError({ status: 503, message: '{"error":{"code":503,"status":"UNAVAILABLE"}}' })

function build() {
  return generatePlan('test-key', file, 'Teach 7th graders', { onModel: () => {} })
}

beforeEach(() => {
  script.replies = []
  script.modelsCalled = []
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

test('returns the plan when the first reply follows the rules', async () => {
  script.replies = [JSON.stringify(validPlan())]
  const result = await build()
  expect(result.plan.steps).toHaveLength(4)
  expect(result.usedBackupModel).toBe(false)
  expect(script.modelsCalled).toEqual([PLAN_MODEL])
})

test('switches to the backup model when the plan model is busy', async () => {
  script.replies = [busy(), JSON.stringify(validPlan())]
  const result = await build()
  expect(result.usedBackupModel).toBe(true)
  expect(script.modelsCalled).toEqual([PLAN_MODEL, PLAN_BACKUP_MODEL])
})

test('asks for one repair when a question has two correct options', async () => {
  const broken = validPlan()
  broken.steps[2].main.options[0].correct = true
  script.replies = [JSON.stringify(broken), JSON.stringify(validPlan())]
  const result = await build()
  expect(result.plan.steps[2].main.options.filter((option) => option.correct)).toHaveLength(1)
  expect(script.modelsCalled).toEqual([PLAN_MODEL, PLAN_MODEL])
})

test('gives up after one failed repair', async () => {
  script.replies = ['not json at all', '{"teachable": true}']
  await expect(build()).rejects.toMatchObject({ code: 'plan_invalid' })
  expect(script.modelsCalled).toHaveLength(2)
})

test('does not retry when the key is rejected', async () => {
  script.replies = [new ApiError({ status: 400, message: '{"error":{"message":"API key not valid. Please pass a valid API key."}}' })]
  const error = await build().catch((caught) => caught)
  expect(describeError(error).code).toBe('invalid_key')
  expect(script.modelsCalled).toHaveLength(1)
})

test('accepts a plan that says the file cannot be taught', () => {
  const plan = { teachable: false, reason: 'This is a shop receipt.', title: '', language: 'English', minutes: 15, passages: [], steps: [] }
  expect(lessonPlanSchema.safeParse(plan).success).toBe(true)
  expect(lessonPlanSchema.safeParse({ ...plan, reason: '' }).success).toBe(false)
})

test('rejects plans that break a teaching rule', () => {
  const noMisconception = validPlan()
  noMisconception.steps[0].parallel.options[1].misconception = ''
  const missingPassage = validPlan()
  missingPassage.steps[1].passageIds = ['p9']
  const tooShort = validPlan()
  tooShort.steps.pop()
  for (const plan of [noMisconception, missingPassage, tooShort]) {
    expect(lessonPlanSchema.safeParse(plan).success).toBe(false)
  }
})

test('reads the wait time out of a rate limit error', () => {
  const body = { error: { code: 429, details: [{ '@type': 'type.googleapis.com/google.rpc.RetryInfo', retryDelay: '36.4s' }] } }
  const described = describeError(new ApiError({ status: 429, message: JSON.stringify(body) }))
  expect(described).toMatchObject({ code: 'rate_limited', retryAfterSeconds: 37 })
  expect(described.message).toContain('37 seconds')
  expect(describeError(busy(), '').code).toBe('model_busy')
})
