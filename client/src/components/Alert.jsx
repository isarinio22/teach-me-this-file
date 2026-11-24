import Button from './Button.jsx'

// A message with an optional next action. An "error" interrupts screen readers; an "info" waits its turn.
export default function Alert({ tone = 'info', title, children, actionLabel, onAction }) {
  const isError = tone === 'error'
  return (
    <div role={isError ? 'alert' : 'status'} className={`border-s-4 ps-4 ${isError ? 'border-pen' : 'border-form'}`}>
      {title && <p className={`font-bold ${isError ? 'text-pen' : ''}`}>{title}</p>}
      <p>{children}</p>
      {actionLabel && <Button variant="quiet" onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
