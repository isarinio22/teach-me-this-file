// The shapes of everything that crosses a boundary, written once with Zod.
// The same definition is used twice: converted to JSON Schema it tells the model what to
// produce, and as a validator it checks what the model actually produced.
import { z } from 'zod'

const option = z.object({
  text: z.string().min(1),
  correct: z.boolean(),
  misconception: z.string().describe('For a wrong option: the specific wrong idea a student who picks it holds. Empty for the correct option.'),
})

const item = z.object({
  stem: z.string().min(1).describe('The question.'),
  options: z.array(option).min(3).max(4),
  explanation: z.string().min(1).describe('One or two sentences on why the correct option is right.'),
})

const step = z.object({
  id: z.string().min(1).describe('s1, s2, ...'),
  title: z.string().min(1),
  objective: z.string().min(1).describe('What the student can do after this step, in one sentence.'),
  passageIds: z.array(z.string()).min(1).describe('The passages this step is taught from.'),
  main: item,
  parallel: item.describe('A different question that tests the same idea as main.'),
})

const passage = z.object({
  id: z.string().min(1).describe('p1, p2, ...'),
  page: z.number().int().min(1),
  text: z.string().min(1).describe('Copied from the file. Formulas in LaTeX between $ signs, tables as Markdown tables.'),
})

const planShape = z.object({
  teachable: z.boolean(),
  reason: z.string().describe('When teachable is false: why, in one sentence, in English. Otherwise empty.'),
  // Before the title: the model writes fields in this order, so it settles the language before writing in one.
  language: z.string().describe('The language of the lesson, as an English word such as French or Hebrew, chosen by the language rules.'),
  title: z.string(),
  minutes: z.number().int().min(1).max(120).describe('The time budget in minutes.'),
  passages: z.array(passage),
  steps: z.array(step),
})

// Rules that a shape cannot express: they compare values with each other.
function checkPlanRules(plan, context) {
  const problem = (message) => context.addIssue({ code: 'custom', message })

  if (!plan.teachable) {
    if (plan.reason.trim() === '') problem('teachable is false, so reason must say why')
    return
  }
  if (plan.steps.length < 4 || plan.steps.length > 8) problem(`a teachable plan has 4 to 8 steps, this one has ${plan.steps.length}`)

  const passageIds = plan.passages.map((passage) => passage.id)
  const stepIds = plan.steps.map((step) => step.id)
  if (new Set(passageIds).size !== passageIds.length) problem('passage ids must be unique')
  if (new Set(stepIds).size !== stepIds.length) problem('step ids must be unique')

  for (const step of plan.steps) {
    for (const id of step.passageIds) {
      if (!passageIds.includes(id)) problem(`step ${step.id} refers to passage ${id}, which does not exist`)
    }
    for (const kind of ['main', 'parallel']) {
      const { options } = step[kind]
      const correct = options.filter((option) => option.correct).length
      if (correct !== 1) problem(`step ${step.id} ${kind}: exactly one option must be correct, found ${correct}`)
      if (options.some((option) => !option.correct && option.misconception.trim() === '')) {
        problem(`step ${step.id} ${kind}: every wrong option needs a misconception`)
      }
    }
  }
}

export const lessonPlanSchema = planShape.superRefine(checkPlanRules)
export const lessonPlanJsonSchema = z.toJSONSchema(planShape)

// One tutor turn: the move nextMove() chose and only the context that move needs.
// The limits stop a forged request from sending a huge prompt on someone else's behalf.
const shortText = (max) => z.string().max(max)

export const turnRequestSchema = z.object({
  move: z.enum(['open', 'teach', 'hint', 'reteach', 'reveal', 'confirm', 'respond', 'recap', 'wrap_up']),
  teacherPrompt: shortText(2000),
  language: shortText(60),
  lessonTitle: shortText(300),
  background: shortText(2000),
  elapsedMinutes: z.number().min(0).max(600),
  budgetMinutes: z.number().min(1).max(120),
  attempt: z.number().int().min(0).max(3),
  history: z.array(z.object({ role: z.enum(['tutor', 'student']), text: shortText(4000) })).max(6),
  outline: z.array(shortText(300)).max(8).optional(),
  outcomes: z.array(z.object({ title: shortText(300), outcome: shortText(30) })).max(8).optional(),
  step: z.object({
    number: z.number().int(),
    of: z.number().int(),
    title: shortText(300),
    objective: shortText(600),
    passages: z.array(z.object({ id: shortText(20), page: z.number().int(), text: shortText(6000) })).max(12),
  }).optional(),
  item: z.object({
    stem: shortText(1000),
    options: z.array(z.object({ number: z.number().int(), text: shortText(500), correct: z.boolean().optional() })).max(4),
    explanation: shortText(1000).optional(),
  }).optional(),
  chosen: z.object({ number: z.number().int(), text: shortText(500), misconception: shortText(500) }).optional(),
  studentMessage: shortText(2000).optional(),
})

// The JSON the tutor writes after its message.
export const turnResultSchema = z.object({
  citedPassageIds: z.array(z.string()).max(12),
  readyForCheck: z.boolean(),
})
