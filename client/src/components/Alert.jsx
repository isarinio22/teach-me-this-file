// A message in a tinted box. An "error" interrupts screen readers; an "info" waits its turn.
export default function Alert({ tone = 'info', children }) {
  const isError = tone === 'error'
  return (
    <p role={isError ? 'alert' : 'status'} className={`rounded-field border-s-4 px-4 py-3 ${isError ? 'border-pen bg-pen/10' : 'border-blue bg-blue/10'}`}>
      {children}
    </p>
  )
}
