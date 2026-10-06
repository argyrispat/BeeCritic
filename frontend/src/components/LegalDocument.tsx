import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type LegalDocumentProps = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function LegalDocument({ title, lastUpdated, children }: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="rounded-sm border border-border bg-surface-2/60 px-4 py-3 text-sm text-muted">
        This application is a portfolio/demo project and is not currently offered as a commercial
        service. The text below is a demonstration template and has not been reviewed by a lawyer.
      </p>

      <h1 className="mt-10 font-display text-4xl text-text sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated: {lastUpdated}</p>

      <div className="legal-prose mt-10 space-y-8 text-[15px] leading-relaxed text-muted">
        {children}
      </div>

      <nav className="mt-14 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-8 text-sm">
        <Link to="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </Link>
        <Link to="/cookies" className="text-accent hover:underline">
          Cookie Policy
        </Link>
        <Link to="/terms" className="text-accent hover:underline">
          Terms of Service
        </Link>
        <Link to="/cookie-settings" className="text-accent hover:underline">
          Cookie Settings
        </Link>
      </nav>
    </article>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="font-display text-2xl text-text">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

export function PlaceholderList() {
  return (
    <ul className="list-disc space-y-1 pl-5 font-mono text-sm text-text">
      <li>[Company Name]</li>
      <li>[Company Address]</li>
      <li>[Contact Email]</li>
    </ul>
  )
}
