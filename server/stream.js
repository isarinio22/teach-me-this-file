// Server-Sent Events: a plain HTTP response that stays open while the server writes
// small named messages into it. The browser reads them as they arrive.

export function openEventStream(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no', // asks proxies not to hold the messages back
  })
}

export function sendEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}
