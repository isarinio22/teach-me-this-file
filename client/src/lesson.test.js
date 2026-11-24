import { expect, test } from 'vitest'
import { removeStep } from './lesson.js'

const plan = { title: 'Photosynthesis', steps: [{ id: 's1' }, { id: 's2' }, { id: 's3' }] }

test('the teacher can remove a step, and the others keep their order', () => {
  expect(removeStep(plan, 's2').steps.map((step) => step.id)).toEqual(['s1', 's3'])
  expect(plan.steps).toHaveLength(3) // the original plan is not changed
})

test('the last step cannot be removed', () => {
  const oneStep = { ...plan, steps: [{ id: 's1' }] }
  expect(removeStep(oneStep, 's1')).toBe(oneStep)
})
