import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCookieConsent } from '@/contexts/CookieConsentContext'

export function CookieSettingsPage() {
  const { preferences, savePreferences, acknowledge } = useCookieConsent()
  const [saved, setSaved] = useState(false)

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="rounded-sm border border-border bg-surface-2/60 px-4 py-3 text-sm text-muted">
        This application is a portfolio/demo project and is not currently offered as a commercial
        service.
      </p>

      <h1 className="mt-10 font-display text-4xl text-text">Cookie Preferences</h1>
      <p className="mt-3 text-sm text-muted">
        Categories reflect technologies actually implemented. Optional analytics and marketing are
        not used and cannot be enabled.
      </p>

      <div className="mt-10 space-y-4">
        <PreferenceRow
          title="Necessary"
          description="Authentication token and consent storage in localStorage. Required for the app to function."
          status="Always active"
          active
        />
        <PreferenceRow
          title="Analytics"
          description="Not currently used. No analytics SDK is loaded."
          status="Disabled"
        />
        <PreferenceRow
          title="Marketing"
          description="Not currently used. No advertising cookies are set."
          status="Disabled"
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="bg-accent px-5 py-2.5 text-sm font-medium text-bg hover:opacity-90"
          onClick={() => {
            savePreferences({
              analytics: preferences.analytics,
              marketing: preferences.marketing,
            })
            acknowledge()
            setSaved(true)
          }}
        >
          Save Preferences
        </button>
        <Link to="/cookies" className="text-sm text-accent hover:underline">
          Read Cookie Policy
        </Link>
      </div>

      {saved && (
        <p className="mt-4 text-sm text-accent" role="status">
          Preferences saved. Necessary storage remains active; optional categories stay disabled.
        </p>
      )}
    </div>
  )
}

function PreferenceRow({
  title,
  description,
  status,
  active = false,
}: {
  title: string
  description: string
  status: string
  active?: boolean
}) {
  return (
    <div className="border border-border bg-surface px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium text-text">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium uppercase tracking-wide ${
            active ? 'text-accent' : 'text-muted'
          }`}
        >
          {status}
        </span>
      </div>
    </div>
  )
}
