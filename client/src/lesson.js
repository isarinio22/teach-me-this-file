// Lesson state and the teaching rules. Pure functions: no React and no network,
// so every rule here can be tested on its own.

// The teacher may drop steps before the lesson starts. One step always stays.
export function removeStep(plan, stepId) {
  if (plan.steps.length === 1) return plan
  return { ...plan, steps: plan.steps.filter((step) => step.id !== stepId) }
}
