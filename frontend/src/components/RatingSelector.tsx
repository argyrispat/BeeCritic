interface RatingSelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export function RatingSelector({ value, onChange, disabled }: RatingSelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = value === n
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              className={`flex h-10 w-10 items-center justify-center border text-sm transition ${
                selected
                  ? 'border-accent bg-accent text-bg'
                  : 'border-border text-muted hover:border-accent hover:text-text'
              } disabled:opacity-50`}
              aria-label={`Rate ${n} out of 10`}
              aria-pressed={selected}
            >
              {n}
            </button>
          )
        })}
      </div>
      {value > 0 && (
        <p className="mt-3 text-sm text-muted">
          Selected: <span className="font-medium text-accent">{value}/10 ★</span>
        </p>
      )}
    </div>
  )
}

export function RatingBadge({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'lg'
      ? 'text-3xl'
      : size === 'sm'
        ? 'text-sm'
        : 'text-xl'

  return (
    <span className={`font-display font-medium text-accent ${sizeClass}`}>
      {rating}/10 ★
    </span>
  )
}
