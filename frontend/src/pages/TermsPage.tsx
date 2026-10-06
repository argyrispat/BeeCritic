import { Link } from 'react-router-dom'
import { LegalDocument, LegalSection, PlaceholderList } from '@/components/LegalDocument'

export function TermsPage() {
  return (
    <LegalDocument title="Terms of Service" lastUpdated="6 October 2026">
      <LegalSection title="1. Nature of the service">
        <p>
          BeeCritic is a portfolio/demo movie review application. It is not currently offered as a
          commercial service, product, or paid subscription. These Terms are a demonstration template
          and are not presented as legally reviewed or legally binding commercial terms.
        </p>
        <p>Commercial entity placeholders (not a real company):</p>
        <PlaceholderList />
      </LegalSection>

      <LegalSection title="2. Eligibility and accounts">
        <p>
          You may create a demo account with a username, email, and password. You are responsible for
          keeping your credentials confidential. Do not use real passwords that you reuse elsewhere.
          Demo credentials published in the project README are intentionally public for evaluation.
        </p>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <p>When using this demo, you agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Attempt to disrupt, overload, or compromise the application or its infrastructure</li>
          <li>Submit unlawful, abusive, or highly sensitive personal content</li>
          <li>Impersonate others in a harmful way</li>
          <li>Scrape or abuse third-party APIs (including TMDB) beyond normal interactive use</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. User content">
        <p>
          Reviews and comments you submit may be publicly visible. You retain ownership of your
          content, and grant the demo operators a non-exclusive license to host and display it as
          part of operating the portfolio project. Content that violates these terms may be removed.
        </p>
      </LegalSection>

      <LegalSection title="5. Movie metadata">
        <p>
          Film titles, posters, cast, and related metadata come from The Movie Database (TMDB). This
          product uses the TMDB API but is not endorsed or certified by TMDB. TMDB content remains
          subject to TMDB’s terms and attribution requirements.
        </p>
      </LegalSection>

      <LegalSection title="6. No warranties">
        <p>
          The demo is provided “as is”, without warranties of any kind, including availability,
          accuracy, or fitness for a particular purpose. It may be reset, taken offline, or changed
          at any time.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitation of liability">
        <p>
          To the fullest extent permitted by applicable law, the project author is not liable for
          damages arising from use of this portfolio demo. Do not rely on it for production workloads
          or real customer data.
        </p>
      </LegalSection>

      <LegalSection title="8. Privacy">
        <p>
          How personal data is handled is described in the{' '}
          <Link to="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          . Storage technologies are described in the{' '}
          <Link to="/cookies" className="text-accent hover:underline">
            Cookie Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          These demonstration terms may be updated as the project evolves. Continued use of a hosted
          demo after changes constitutes acknowledgment of the updated text for portfolio purposes
          only.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>Commercial contact placeholders:</p>
        <PlaceholderList />
        <p>For this portfolio project, contact the maintainer via the public GitHub repository.</p>
      </LegalSection>
    </LegalDocument>
  )
}
