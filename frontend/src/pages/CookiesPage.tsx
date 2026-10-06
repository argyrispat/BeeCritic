import { Link } from 'react-router-dom'
import { LegalDocument, LegalSection, PlaceholderList } from '@/components/LegalDocument'

export function CookiesPage() {
  return (
    <LegalDocument title="Cookie Policy" lastUpdated="6 October 2026">
      <LegalSection title="1. Overview">
        <p>
          This Cookie Policy explains how BeeCritic, a portfolio/demo application, uses cookies and
          similar technologies. It is a demonstration template and has not been reviewed by a lawyer.
        </p>
        <p>Commercial controller placeholders (not a real company):</p>
        <PlaceholderList />
      </LegalSection>

      <LegalSection title="2. What we actually use">
        <p>
          After inspecting this application’s implementation, BeeCritic currently relies on{' '}
          <strong className="font-medium text-text">browser localStorage</strong> for authentication
          and preferences. It does <strong className="font-medium text-text">not</strong> set
          authentication session cookies, analytics cookies, or advertising cookies.
        </p>
      </LegalSection>

      <LegalSection title="3. Necessary storage">
        <p>Used for authentication and maintaining application functionality:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-text">beecritic_token</span> — JWT used as{' '}
            <code className="text-text">Authorization: Bearer</code> for authenticated API requests
          </li>
          <li>
            <span className="text-text">beecritic_user</span> — non-sensitive signed-in user snapshot
            (id, username, email) for UI state
          </li>
          <li>
            <span className="text-text">beecritic_theme</span> — light/dark theme preference
          </li>
          <li>
            <span className="text-text">beecritic_cookie_consent</span> — records that you
            acknowledged this notice / saved preferences
          </li>
        </ul>
        <p>These items are technically necessary for the demo to work as designed.</p>
      </LegalSection>

      <LegalSection title="4. Analytics cookies">
        <p>Not currently used. No Google Analytics, Plausible, Mixpanel, or similar tools are integrated.</p>
      </LegalSection>

      <LegalSection title="5. Advertising cookies">
        <p>Not currently used. No advertising or retargeting pixels are integrated.</p>
      </LegalSection>

      <LegalSection title="6. Third-party requests">
        <p>
          The frontend may load fonts from Google Fonts (
          <code className="text-text">fonts.googleapis.com</code> /{' '}
          <code className="text-text">fonts.gstatic.com</code>). Movie imagery and metadata are
          requested through the BeeCritic API, which proxies TMDB. Those services may process
          technical request data according to their own policies.
        </p>
      </LegalSection>

      <LegalSection title="7. Managing preferences">
        <p>
          You can review categories on the{' '}
          <Link to="/cookie-settings" className="text-accent hover:underline">
            Cookie Settings
          </Link>{' '}
          page. Because optional analytics and marketing technologies are not implemented, those
          categories remain disabled. Clearing site data in your browser will also remove
          localStorage items (including your session).
        </p>
      </LegalSection>

      <LegalSection title="8. Future optional categories">
        <p>
          If optional analytics are added later, the consent UI is structured to support Necessary /
          Analytics / Marketing categories, with optional categories disabled by default. This demo
          does not implement fake analytics or marketing cookies merely for demonstration.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
