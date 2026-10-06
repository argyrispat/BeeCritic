import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-sm border border-dashed border-border px-6 py-12 text-center">
      <h3 className="font-display text-xl text-text">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-sm border border-border bg-surface px-6 py-10 text-center">
      <h3 className="font-display text-xl text-text">{title}</h3>
      {message && <p className="mt-2 text-sm text-muted">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 border border-border px-4 py-2 text-sm text-text hover:border-accent"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  )
}
