import { expect, test } from 'vitest'
import { lessonReducer, nextMove, optionOrder, turnRequest, weakestSteps } from './lesson.js'

// A plan with n steps. In every main question option 1 is correct; in every parallel question, option 0.
function makePlan(n = 3) {
  const question = (correct) => ({
    stem: 'Where does most of a plant’s mass come from?',
    options: ['the soil', 'the air', 'water', 'sunlight'].map((text, index) => ({
      text,
      correct: index === correct,
      misconception: index === correct ? '' : `thinks the mass comes from ${text}`,
    })),
    explanation: 'Carbon dioxide from the air.',
  })
  const steps = Array.from({ length: n }, (_, i) => ({
    id: `s${i + 1}`,
    title: `Step ${i + 1}`,
    objective: 'Explain one idea',
    passageIds: ['p1'],
    main: question(1),
    parallel: question(0),
  }))
  return { title: 'Photosynthesis', language: 'English', minutes: 15, passages: [{ id: 'p1', page: 1, text: 'A passage.' }], steps }
}

const RIGHT_MAIN = 1
const WRONG = 2
const RIGHT_PARALLEL = 0

// Plays a list of events from the start of a lesson. Strings are shortcuts for the common ones.
function play(...events) {
  const start = { type: 'started', plan: makePlan(), teacherPrompt: '', now: 0, seed: 42 }
  return [start, ...events].reduce((state, event) => {
    if (event === 'reply') return lessonReducer(state, { type: 'tutor_replied', text: 'Tutor text', turn: { citedPassageIds: ['p1'], readyForCheck: true } })
    if (event === 'next') return lessonReducer(state, { type: 'continued' })
    if (typeof event === 'number') return lessonReducer(state, { type: 'option_chosen', optionIndex: event })
    if (typeof event === 'string') return lessonReducer(state, { type: 'message_typed', text: event })
    return lessonReducer(state, event)
  }, undefined)
}

// Opening question, the student's answer, and the first step's teaching, up to its check question.
const OPENING = ['reply', 'I know plants need light', 'reply']

test('the lesson opens by asking what the student knows, and the answer is kept', () => {
  expect(nextMove(play())).toBe('open')
  expect(nextMove(play('reply'))).toBe(null)
  const state = play('reply', 'I know plants need light')
  expect(state.background).toBe('I know plants need light')
  expect(nextMove(state)).toBe('teach')
})

test('the check question appears when the tutor is ready, or after two teaching turns', () => {
  const notReady = { type: 'tutor_replied', text: 'What do you think?', turn: { citedPassageIds: [], readyForCheck: false } }
  expect(play('reply', 'nothing', notReady).phase).toBe('teaching')
  expect(play('reply', 'nothing', notReady, 'the air?', notReady).phase).toBe('checking')
  expect(play(...OPENING).phase).toBe('checking')
})

test('a right answer on the first try gets a short why, then the next step', () => {
  const state = play(...OPENING, RIGHT_MAIN)
  expect(nextMove(state)).toBe('confirm')
  expect(state.outcomes.s1).toBe('first_try')
  const moved = play(...OPENING, RIGHT_MAIN, 'reply', 'next')
  expect(moved.stepIndex).toBe(1)
  expect(nextMove(moved)).toBe('teach')
})

test('the hint ladder: hint, then a new explanation with the parallel question, then the answer', () => {
  const first = play(...OPENING, WRONG)
  expect(nextMove(first)).toBe('hint')
  expect(first.crossedOut).toEqual([WRONG])
  expect(first.misconceptions).toEqual([{ stepId: 's1', text: 'thinks the mass comes from water' }])

  const second = play(...OPENING, WRONG, 'reply', 3)
  expect(nextMove(second)).toBe('reteach')
  const parallel = play(...OPENING, WRONG, 'reply', 3, 'reply')
  expect(parallel.itemKind).toBe('parallel')
  expect(parallel.crossedOut).toEqual([])

  const third = play(...OPENING, WRONG, 'reply', 3, 'reply', WRONG)
  expect(nextMove(third)).toBe('reveal')
  expect(third.outcomes.s1).toBe('needs_review')
  expect(play(...OPENING, WRONG, 'reply', 3, 'reply', WRONG, 'reply').phase).toBe('answered')
})

test('each step records how it went', () => {
  expect(play(...OPENING, WRONG, 'reply', RIGHT_MAIN).outcomes.s1).toBe('after_hint')
  expect(play(...OPENING, WRONG, 'reply', 3, 'reply', RIGHT_PARALLEL).outcomes.s1).toBe('after_reteach')
})

test('a question typed during a check is answered without changing the question', () => {
  const state = play(...OPENING, 'Is this about leaves?')
  expect(nextMove(state)).toBe('respond')
  expect(play(...OPENING, 'Is this about leaves?', 'reply').phase).toBe('checking')
})

// Step 1 right after a hint, step 2 needs review, step 3 right first time.
const WHOLE_LESSON = [
  ...OPENING, WRONG, 'reply', RIGHT_MAIN, 'reply', 'next',
  'reply', WRONG, 'reply', 3, 'reply', WRONG, 'reply', 'next',
  'reply', RIGHT_MAIN, 'reply', 'next',
]

test('the recap brings back the weakest steps, worst first, at most two', () => {
  const state = play(...WHOLE_LESSON)
  expect(weakestSteps(state)).toEqual(['s2', 's1'])
  expect(state.review.stepIds).toEqual(['s2', 's1'])
  expect(state.stepIndex).toBe(1)
  expect(state.itemKind).toBe('main')
  expect(nextMove(state)).toBe('recap')

  const missed = play(...WHOLE_LESSON, 'reply', WRONG)
  expect(nextMove(missed)).toBe('reveal') // no ladder in the review: one try, then the answer
  expect(missed.review.results.s2).toBe(false)

  const secondReview = play(...WHOLE_LESSON, 'reply', WRONG, 'reply', 'next')
  expect(secondReview.stepIndex).toBe(0)
  expect(secondReview.itemKind).toBe('parallel') // step 1 never saw its parallel question

  const end = play(...WHOLE_LESSON, 'reply', WRONG, 'reply', 'next', 'reply', RIGHT_PARALLEL, 'reply', 'next')
  expect(nextMove(end)).toBe('wrap_up')
  expect(play(...WHOLE_LESSON, 'reply', WRONG, 'reply', 'next', 'reply', RIGHT_PARALLEL, 'reply', 'next', 'reply').phase).toBe('finished')
})

test('a lesson with every step right the first time has no recap', () => {
  const state = play(...OPENING, RIGHT_MAIN, 'reply', 'next', 'reply', RIGHT_MAIN, 'reply', 'next', 'reply', RIGHT_MAIN, 'reply', 'next')
  expect(state.review).toBe(null)
  expect(nextMove(state)).toBe('wrap_up')
})

test('options are shuffled, the same way on every render', () => {
  const state = play(...OPENING)
  const order = optionOrder(state)
  expect([...order].sort()).toEqual([0, 1, 2, 3])
  expect(optionOrder(state)).toEqual(order)
  const positions = new Set()
  for (let seed = 0; seed < 20; seed++) positions.add(optionOrder({ ...state, seed }).indexOf(RIGHT_MAIN))
  expect(positions.size).toBeGreaterThan(2)
})

test('the tutor does not see the check question while teaching, nor the answer while hinting', () => {
  const teach = turnRequest(play('reply', 'nothing'), 'teach', 60000)
  expect(teach.item).toBeUndefined()
  expect(teach.elapsedMinutes).toBe(1)

  const hint = turnRequest(play(...OPENING, WRONG), 'hint', 0)
  expect(hint.item.options.some((option) => 'correct' in option)).toBe(false)
  expect(hint.item.explanation).toBeUndefined()
  expect(hint.chosen.misconception).toBe('thinks the mass comes from water')

  const confirm = turnRequest(play(...OPENING, RIGHT_MAIN), 'confirm', 0)
  expect(confirm.item.options.filter((option) => option.correct)).toHaveLength(1)
  expect(confirm.item.explanation).toBe('Carbon dioxide from the air.')
})
