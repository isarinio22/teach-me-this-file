const looks = {
  primary: 'bg-form px-5 text-paper hover:bg-ink',
  secondary: 'border border-form px-5 text-form hover:bg-rule',
  quiet: 'text-form underline underline-offset-4 hover:text-ink',
}

// Every button in the app. min-h-11 is 44px, the smallest comfortable tap target.
export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center rounded-form font-medium disabled:opacity-50 ${looks[variant]} ${className}`}
      {...props}
    />
  )
}
