import { Link } from 'react-router-dom'
import { useCookieConsent } from '@/contexts/CookieConsentContext'

export function CookieConsentBanner() {
  const { hasAcknowledged, acknowledge } = useCookieConsent()

  if (hasAcknowledged) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md sm:p-5"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="max-w-2xl">
          <p className="font-display text-lg text-text">Cookie notice</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We use necessary browser storage for authentication tokens, theme preference, and this
            consent choice. Analytics and advertising cookies are not currently used.{' '}
            <Link to="/cookies" className="text-accent hover:underline">
              Cookie Policy
            </Link>
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Link
            to="/cookie-settings"
            className="border border-border px-4 py-2 text-sm text-text hover:border-accent hover:text-accent"
          >
            Cookie Settings
          </Link>
          <button
            type="button"
            onClick={acknowledge}
            className="bg-accent px-5 py-2 text-sm font-medium text-bg hover:opacity-90"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
