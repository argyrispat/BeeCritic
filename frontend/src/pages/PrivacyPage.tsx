import { Link } from 'react-router-dom'
import { LegalDocument, LegalSection, PlaceholderList } from '@/components/LegalDocument'

export function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" lastUpdated="6 October 2026">
      <LegalSection title="1. Introduction">
        <p>
          BeeCritic (“we”, “us”) is a portfolio/demo movie review application. This privacy policy
          describes how the demo processes personal data when you create an account or use the
          service. It is written as a reasonable demonstration template and is not a legally binding
          or lawyer-reviewed document.
        </p>
        <p>
          In a commercial deployment, the controller details would appear here. Placeholders for a
          real deployment:
        </p>
        <PlaceholderList />
      </LegalSection>

      <LegalSection title="2. What information is collected">
        <p>
          BeeCritic aims to collect only the data needed to operate the demo. We do not intentionally
          collect government IDs, dates of birth, gender, health data, precise GPS location, or other
          special-category personal data.
        </p>

        <h3 className="pt-2 font-medium text-text">Account information</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Username (public on your profile and reviews)</li>
          <li>Email address (used for sign-in; not shown on public profiles)</li>
          <li>Password hash (passwords are hashed with BCrypt and never stored in plaintext)</li>
          <li>Account creation timestamp</li>
        </ul>

        <h3 className="pt-2 font-medium text-text">Application data you create</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Movie reviews (rating and written content)</li>
          <li>Comments on reviews</li>
          <li>Associated TMDB movie identifiers linking reviews to film metadata</li>
        </ul>

        <h3 className="pt-2 font-medium text-text">Technical / local data</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Authentication JWT and a small user snapshot stored in the browser’s{' '}
            <code className="text-text">localStorage</code> while you remain signed in
          </li>
          <li>Cookie/storage consent acknowledgment stored locally</li>
        </ul>

        <p>
          Movie metadata and imagery are retrieved from The Movie Database (TMDB) via our API proxy.
          BeeCritic does not claim ownership of TMDB content.
        </p>
      </LegalSection>

      <LegalSection title="3. Why information is collected">
        <ul className="list-disc space-y-1 pl-5">
          <li>Authentication and account security</li>
          <li>Providing core application functionality (reviews, comments, profiles)</li>
          <li>Displaying public usernames with user-generated content</li>
          <li>Remembering consent preferences on your device</li>
          <li>Demonstrating the application’s functionality as a portfolio project</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How information is stored">
        <p>
          Account and application data are stored in a PostgreSQL database accessed by the BeeCritic
          API. Passwords are stored only as BCrypt hashes. Authentication uses short-lived JWTs
          validated server-side. Consent preferences remain on your device.
        </p>
      </LegalSection>

      <LegalSection title="5. Who can access the data">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="text-text">Public:</span> usernames, reviews, ratings, comments, and
            profile creation dates
          </li>
          <li>
            <span className="text-text">You (when signed in):</span> your email via the auth response
            stored locally; your own content for editing/deletion
          </li>
          <li>
            <span className="text-text">Server operators of this demo:</span> database contents as
            needed to run and maintain the portfolio environment
          </li>
        </ul>
        <p>
          Ownership of reviews and comments is enforced on the server. There are no user roles to
          escalate, and users cannot mutate other users’ content through the API.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          For this portfolio demo, account and user-generated content are retained for as long as the
          demo environment exists, unless manually removed by the operator. A commercial product
          would define retention schedules, account deletion, and export workflows. Those automated
          GDPR request tools are intentionally not built into this demo.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>Reasonable measures used in this demo include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>BCrypt password hashing</li>
          <li>JWT authentication with server-side validation</li>
          <li>Server-side ownership checks on mutations</li>
          <li>Rate limiting on API endpoints</li>
          <li>Security-related HTTP headers on API responses</li>
          <li>Avoiding logging of passwords or JWT tokens</li>
        </ul>
        <p>
          No demo environment can guarantee absolute security. Do not reuse real personal passwords
          or submit real personal data beyond what you are comfortable sharing in a public portfolio
          demo.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies and similar technologies">
        <p>
          BeeCritic does not currently use analytics or advertising cookies. Authentication relies on
          Bearer tokens in browser storage rather than authentication cookies. See the{' '}
          <Link to="/cookies" className="text-accent hover:underline">
            Cookie Policy
          </Link>{' '}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="9. Your rights">
        <p>
          Under GDPR and similar frameworks, individuals may have rights of access, rectification,
          erasure, restriction, portability, and objection. In a commercial deployment, requests
          would be handled via the contact details below. For this portfolio demo, contact the
          project maintainer through the repository if you need content removed from a hosted demo
          instance.
        </p>
      </LegalSection>

      <LegalSection title="10. Third parties">
        <p>
          TMDB provides movie metadata. Google Fonts may be loaded from Google’s servers to render
          typography. We do not integrate advertising networks or third-party analytics SDKs in this
          demo.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact information">
        <p>Commercial contact placeholders (not a real company):</p>
        <PlaceholderList />
        <p>
          For this portfolio project, prefer opening an issue or contacting the maintainer via the
          public GitHub repository.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>
          This demonstration policy may be updated as the portfolio project evolves. The “Last
          updated” date at the top will change when material edits are made.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
