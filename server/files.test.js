import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { checkFile } from './files.js'

// The same shape multer gives an uploaded file.
function upload(name, content) {
  return { originalname: name, buffer: Buffer.from(content) }
}

function fixture(name) {
  return upload(name, readFileSync(new URL(`../test-files/synthetic/${name}`, import.meta.url)))
}

test('accepts a real PDF', () => {
  expect(checkFile(fixture('empty.pdf'))).toEqual({ mimeType: 'application/pdf' })
})

test('accepts UTF-8 text in any language', () => {
  expect(checkFile(fixture('photosynthesis.txt'))).toEqual({ mimeType: 'text/plain' })
  expect(checkFile(upload('שיעור.md', '# פוטוסינתזה\nצמחים מייצרים גלוקוז.'))).toEqual({ mimeType: 'text/plain' })
})

test('recognizes images by their first bytes', () => {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]
  const jpeg = [0xff, 0xd8, 0xff, 0xe0, 0x00]
  const webp = [...Buffer.from('RIFF'), 0x24, 0x00, 0x00, 0x00, ...Buffer.from('WEBP')]
  expect(checkFile(upload('page.png', png))).toEqual({ mimeType: 'image/png' })
  expect(checkFile(upload('SCAN.JPG', jpeg))).toEqual({ mimeType: 'image/jpeg' })
  expect(checkFile(upload('photo.webp', webp))).toEqual({ mimeType: 'image/webp' })
})

test('rejects a PNG that is named .pdf', () => {
  const { error } = checkFile(fixture('fake.pdf'))
  expect(error.code).toBe('unsupported_type')
  expect(error.message).toContain('named .pdf')
  expect(error.message).toContain('a PNG image')
})

test('rejects an empty file', () => {
  expect(checkFile(upload('notes.txt', '')).error.code).toBe('empty_file')
})

test('rejects a file type that is not supported', () => {
  const { error } = checkFile(upload('slides.pptx', 'PK\x03\x04'))
  expect(error.code).toBe('unsupported_type')
  expect(error.message).toContain('slides.pptx')
})

test('rejects a text file that is not UTF-8', () => {
  const windows1255Hebrew = [0xf9, 0xec, 0xe5, 0xed] // "שלום" in the old Windows Hebrew encoding
  const { error } = checkFile(upload('notes.txt', windows1255Hebrew))
  expect(error.code).toBe('unsupported_type')
  expect(error.message).toContain('UTF-8')
})

test('rejects unreadable content behind a supported name', () => {
  const { error } = checkFile(upload('scan.pdf', [0x00, 0x01, 0x02, 0x03]))
  expect(error.code).toBe('unsupported_type')
  expect(error.message).toContain('not a readable file')
})
