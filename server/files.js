// Upload checks. A file's real type is read from its first bytes ("magic bytes"),
// because anyone can rename a file. The name's ending must then agree with the content.

const SUPPORTED = 'Upload a PDF, PNG, JPEG, WEBP, TXT or MD file.'

const TYPE_BY_ENDING = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  txt: 'text/plain',
  md: 'text/plain',
}

const TYPE_NAMES = {
  'application/pdf': 'a PDF',
  'image/png': 'a PNG image',
  'image/jpeg': 'a JPEG image',
  'image/webp': 'a WEBP image',
  'text/plain': 'plain text',
}

// Compares raw bytes with a string, like data[offset:offset + n] == b'...' in Python.
function hasBytes(buffer, offset, text) {
  return buffer.toString('latin1', offset, offset + text.length) === text
}

// Text files have no magic bytes, so text means: valid UTF-8 with no zero bytes.
function isUtf8Text(buffer) {
  if (buffer.includes(0)) return false
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    return true
  } catch {
    return false
  }
}

function detectType(buffer) {
  if (hasBytes(buffer, 0, '%PDF-')) return 'application/pdf'
  if (hasBytes(buffer, 0, '\x89PNG\r\n\x1a\n')) return 'image/png'
  if (hasBytes(buffer, 0, '\xff\xd8\xff')) return 'image/jpeg'
  if (hasBytes(buffer, 0, 'RIFF') && hasBytes(buffer, 8, 'WEBP')) return 'image/webp'
  if (isUtf8Text(buffer)) return 'text/plain'
  return null
}

// Takes the uploaded file ({ originalname, buffer }) and returns either
// { mimeType } or { error: { code, message } }.
export function checkFile(file) {
  if (file.buffer.length === 0) {
    return { error: { code: 'empty_file', message: 'This file is empty. Choose a file that has content.' } }
  }

  const ending = file.originalname.split('.').pop().toLowerCase()
  const expected = TYPE_BY_ENDING[ending]
  if (!expected) {
    return { error: { code: 'unsupported_type', message: `"${file.originalname}" is not a supported file type. ${SUPPORTED}` } }
  }

  const detected = detectType(file.buffer)
  if (detected === expected) return { mimeType: detected }

  if (expected === 'text/plain' && detected === null) {
    const message = 'This text file is not saved as UTF-8. Save it with UTF-8 encoding, then upload it again.'
    return { error: { code: 'unsupported_type', message } }
  }
  const content = detected ? `its content is ${TYPE_NAMES[detected]}` : 'its content is not a readable file of that type'
  const message = `This file is named .${ending}, but ${content}. Export it again in the right format, then upload it.`
  return { error: { code: 'unsupported_type', message } }
}
