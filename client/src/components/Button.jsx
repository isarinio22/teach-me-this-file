const looks = {
  primary: 'bg-blue px-6 text-paper hover:bg-ink',
  secondary: 'border border-graphite/70 bg-paper px-5 text-ink hover:border-ink',
  quiet: 'text-blue underline underline-offset-4 hover:text-ink',
}

// Every button in the app. min-h-11 is 44px, the smallest comfortable tap target.
export default function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center rounded-pill font-medium disabled:opacity-50 ${looks[variant]} ${className}`}
      {...props}
    />
  )
}
