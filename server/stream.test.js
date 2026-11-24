import { expect, test } from 'vitest'
import { finishSplit, SPLIT_START, splitChunk } from './stream.js'

// Feeds chunks one by one, as they arrive from the model, and collects what would be shown.
function feed(chunks) {
  let split = SPLIT_START
  const shown = []
  for (const chunk of chunks) {
    const result = splitChunk(split, chunk)
    split = result.split
    shown.push(result.show)
  }
  const end = finishSplit(split)
  return { shown, text: shown.join('') + end.show, turn: end.turn }
}

const JSON_TEXT = '{"citedPassageIds": ["p2"], "readyForCheck": true}'

test('separates the text from the JSON', () => {
  const { text, turn } = feed(['Plants make food.\n@@TURN@@\n', JSON_TEXT])
  expect(text).toBe('Plants make food.\n')
  expect(turn).toEqual({ citedPassageIds: ['p2'], readyForCheck: true })
})

test('handles a delimiter cut across chunks without showing any part of it', () => {
  const { shown, text, turn } = feed(['Light splits water. @', '@TU', 'RN', '@@ {"citedPassageIds": [],', ' "readyForCheck": false}'])
  expect(shown.join('')).not.toContain('@')
  expect(text).toBe('Light splits water. ')
  expect(turn).toEqual({ citedPassageIds: [], readyForCheck: false })
})

test('releases held text that turns out not to be the delimiter', () => {
  const { text, turn } = feed(['Email me @', '@ school', ' tomorrow.\n@@TURN@@', JSON_TEXT])
  expect(text).toBe('Email me @@ school tomorrow.\n')
  expect(turn.readyForCheck).toBe(true)
})

test('shows all the text and gives no turn when the JSON is missing', () => {
  const { text, turn } = feed(['The answer is in the passage', ' on page 2. @'])
  expect(text).toBe('The answer is in the passage on page 2. @')
  expect(turn).toBe(null)
})

test('gives no turn when the JSON is invalid or has the wrong shape', () => {
  expect(feed(['Hi\n@@TURN@@\n{"citedPassageIds": [', 'oops']).turn).toBe(null)
  expect(feed(['Hi\n@@TURN@@\n{"readyForCheck": "yes"}']).turn).toBe(null)
})

test('accepts JSON wrapped in a code fence', () => {
  expect(feed(['Hi\n@@TURN@@\n```json\n', JSON_TEXT, '\n```']).turn).toEqual({ citedPassageIds: ['p2'], readyForCheck: true })
})
