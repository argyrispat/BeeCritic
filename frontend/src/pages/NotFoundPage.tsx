import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-[0.25em] text-muted">404</p>
      <h1 className="mt-3 font-display text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">This reel isn’t in the archive.</p>
      <Link to="/" className="mt-8 bg-accent px-5 py-2.5 text-sm font-medium text-bg">
        Back home
      </Link>
    </div>
  )
}
