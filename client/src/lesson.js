// Lesson state and the teaching rules from docs/PEDAGOGY.md. Pure functions: no React, no
// network, no clock and no randomness inside, so every rule can be tested on its own.

// The tutor's move after the 1st, 2nd and 3rd wrong answer in a step (rule 5, the hint ladder).
const LADDER = ['hint', 'reteach', 'reveal']
// A step's outcome, named by how many wrong answers came before the right one.
const OUTCOMES = ['first_try', 'after_hint', 'after_reteach', 'needs_review']
const MAX_TEACH_TURNS = 2 // tutor turns in a step before its check question appears
const MAX_REVIEW = 2 // weakest steps asked again at the end (rule 8)
const HISTORY = 6 // recent messages the tutor sees on each turn

function startLesson({ plan, teacherPrompt, now, seed }) {
  return {
    plan,
    teacherPrompt,
    startedAt: now,
    seed, // fixes the order of the options for this lesson
    phase: 'opening', // opening, teaching, checking, answered, closing, finished
    stepIndex: 0,
    itemKind: 'main', // which question of the step is on the answer sheet: main or parallel
    misses: 0, // wrong answers in this step
    crossedOut: [], // options already missed on the current question
    teachTurns: 0,
    lastAnswer: null, // { optionIndex, correct }
    review: null, // at the end: { stepIds, index, results: { stepId: true or false } }
    outcomes: {}, // { stepId: one of OUTCOMES }
    misconceptions: [], // [{ stepId, text }]
    background: '', // what the student said they already know; it sets the pace
    messages: [], // [{ role, text, section, passageIds, choice, stopped }]
    waitingFor: 'start', // why the tutor must speak next, or null when it is the student's turn
  }
}

export function currentStep(state) {
  return state.plan.steps[state.stepIndex]
}

export function currentItem(state) {
  return currentStep(state)[state.itemKind]
}

// The part of the lesson on screen. Only the current step is shown, to keep the student on one idea.
export function section(state) {
  if (state.phase === 'closing' || state.phase === 'finished') return 'end'
  return state.review ? `review-${currentStep(state).id}` : currentStep(state).id
}

// The heart of the method: what the tutor does next, or null when it is the student's turn.
export function nextMove(state) {
  switch (state.waitingFor) {
    case 'start': return 'open'
    case 'step': return 'teach'
    case 'review': return 'recap'
    case 'end': return 'wrap_up'
    case 'message': return state.phase === 'teaching' ? 'teach' : 'respond'
    case 'answer':
      if (state.lastAnswer.correct) return 'confirm'
      return state.review ? 'reveal' : LADDER[state.misses - 1]
    default: return null
  }
}

// The order the options are shown in. Models tend to put the right answer in the same place and
// students learn such patterns, so the app shuffles. The order is computed from the lesson's seed,
// so it is the same on every render and this file stays free of randomness.
export function optionOrder(state) {
  let hash = 2166136261
  for (const char of `${state.seed}:${currentStep(state).id}:${state.itemKind}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  const order = currentItem(state).options.map((option, index) => index)
  for (let i = order.length - 1; i > 0; i--) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0
    const j = Math.floor((hash / 2 ** 32) * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

// The steps that went worst, worst first, at most two. A step right on the first try never comes back.
export function weakestSteps(state) {
  const rank = (step) => OUTCOMES.indexOf(state.outcomes[step.id])
  const weak = state.plan.steps.filter((step) => rank(step) > 0)
  return weak.sort((a, b) => rank(b) - rank(a)).slice(0, MAX_REVIEW).map((step) => step.id)
}

function withMessage(state, message) {
  return [...state.messages, { ...message, section: section(state) }]
}

function messageTyped(state, text) {
  const messages = withMessage(state, { role: 'student', text })
  if (state.phase === 'opening') return { ...state, messages, background: text, phase: 'teaching', waitingFor: 'step' }
  return { ...state, messages, waitingFor: 'message' }
}

// Multiple-choice answers are graded here, by the app, instantly (PEDAGOGY.md).
function optionChosen(state, optionIndex) {
  const step = currentStep(state)
  const option = currentItem(state).options[optionIndex]
  let next = {
    ...state,
    messages: withMessage(state, { role: 'student', text: option.text, choice: state.itemKind }), // which question it answers
    lastAnswer: { optionIndex, correct: option.correct },
    waitingFor: 'answer',
  }
  if (!option.correct) {
    next = {
      ...next,
      crossedOut: [...state.crossedOut, optionIndex],
      misconceptions: [...state.misconceptions, { stepId: step.id, text: option.misconception }],
    }
  }
  if (state.review) return { ...next, review: { ...state.review, results: { ...state.review.results, [step.id]: option.correct } } }
  if (option.correct) return { ...next, outcomes: { ...state.outcomes, [step.id]: OUTCOMES[state.misses] } }
  const misses = state.misses + 1
  const outcomes = misses === LADDER.length ? { ...state.outcomes, [step.id]: 'needs_review' } : state.outcomes
  return { ...next, misses, outcomes }
}

// What the move that just ended changes. `turn` is the tutor's JSON, or null when it was
// missing, invalid, or the student stopped the reply.
function tutorReplied(state, { text, turn, stopped }) {
  const move = nextMove(state)
  const tutorNote = { role: 'tutor', text, passageIds: turn?.citedPassageIds ?? [], stopped }
  const next = { ...state, messages: text ? withMessage(state, tutorNote) : state.messages, waitingFor: null }
  if (move === 'teach') {
    const teachTurns = state.teachTurns + 1
    const ready = turn?.readyForCheck || teachTurns >= MAX_TEACH_TURNS
    return { ...next, teachTurns, phase: ready ? 'checking' : 'teaching' }
  }
  if (move === 'reteach') return { ...next, itemKind: 'parallel', crossedOut: [], lastAnswer: null }
  if (move === 'confirm' || move === 'reveal') return { ...next, phase: 'answered' }
  if (move === 'wrap_up') return { ...next, phase: 'finished' }
  return next // open, hint, respond and recap leave the phase as it is
}

// The student moves on: to the next step, to the review questions, or to the end.
function continued(state) {
  const fresh = { itemKind: 'main', misses: 0, crossedOut: [], teachTurns: 0, lastAnswer: null }
  if (!state.review && state.stepIndex + 1 < state.plan.steps.length) {
    return { ...state, ...fresh, stepIndex: state.stepIndex + 1, phase: 'teaching', waitingFor: 'step' }
  }
  const stepIds = state.review ? state.review.stepIds : weakestSteps(state)
  const index = state.review ? state.review.index + 1 : 0
  if (index >= stepIds.length) return { ...state, ...fresh, phase: 'closing', waitingFor: 'end' }
  // A step right after a hint never saw its parallel question, so the review uses it.
  const itemKind = state.outcomes[stepIds[index]] === 'after_hint' ? 'parallel' : 'main'
  const stepIndex = state.plan.steps.findIndex((step) => step.id === stepIds[index])
  const review = { stepIds, index, results: state.review?.results ?? {} }
  return { ...state, ...fresh, stepIndex, itemKind, review, phase: 'checking', waitingFor: 'review' }
}

export function lessonReducer(state, event) {
  switch (event.type) {
    case 'started': return startLesson(event)
    case 'message_typed': return messageTyped(state, event.text)
    case 'check_requested': return { ...state, phase: 'checking' }
    case 'option_chosen': return optionChosen(state, event.optionIndex)
    case 'tutor_replied': return tutorReplied(state, event)
    case 'continued': return continued(state)
    default: return state
  }
}

// What the tutor is told for one move. Part of the method: the tutor never sees the check
// question while it teaches, and learns which option is correct only when it confirms or reveals.
export function turnRequest(state, move, now) {
  const step = currentStep(state)
  const answered = ['message', 'answer'].includes(state.waitingFor) // the last message is the one being answered
  const request = {
    move,
    teacherPrompt: state.teacherPrompt,
    language: state.plan.language,
    lessonTitle: state.plan.title,
    background: state.background,
    elapsedMinutes: Math.round((now - state.startedAt) / 60000),
    budgetMinutes: state.plan.minutes,
    attempt: state.misses,
    history: (answered ? state.messages.slice(0, -1) : state.messages).slice(-HISTORY).map(({ role, text }) => ({ role, text })),
  }
  if (move === 'open' || move === 'wrap_up') request.outline = state.plan.steps.map((item) => item.title)
  else {
    const passages = state.plan.passages.filter((passage) => step.passageIds.includes(passage.id))
    request.step = { number: state.stepIndex + 1, of: state.plan.steps.length, title: step.title, objective: step.objective, passages }
  }
  if (move === 'wrap_up') request.outcomes = state.plan.steps.map((item) => ({ title: item.title, outcome: state.outcomes[item.id] ?? 'not_reached' }))
  if (['hint', 'reteach', 'reveal', 'confirm', 'respond', 'recap'].includes(move)) {
    const item = currentItem(state)
    const showAnswer = move === 'confirm' || move === 'reveal'
    const options = optionOrder(state).map((index, position) => ({
      number: position + 1,
      text: item.options[index].text,
      ...(showAnswer && { correct: item.options[index].correct }),
    }))
    request.item = { stem: item.stem, options, ...(showAnswer && { explanation: item.explanation }) }
  }
  if (state.waitingFor === 'message') request.studentMessage = state.messages.at(-1).text
  if (state.waitingFor === 'answer') {
    const option = currentItem(state).options[state.lastAnswer.optionIndex]
    const number = optionOrder(state).indexOf(state.lastAnswer.optionIndex) + 1
    request.chosen = { number, text: option.text, misconception: option.misconception }
  }
  return request
}
