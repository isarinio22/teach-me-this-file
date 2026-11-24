// A message beside a colored margin bar. An "error" interrupts screen readers; an "info" waits its turn.
export default function Alert({ tone = 'info', children }) {
  const isError = tone === 'error'
  return (
    <p role={isError ? 'alert' : 'status'} className={`border-s-4 ps-4 ${isError ? 'border-pen' : 'border-form'}`}>
      {children}
    </p>
  )
}
