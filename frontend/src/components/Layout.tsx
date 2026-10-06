import { Link, Outlet } from 'react-router-dom'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { Navbar } from '@/components/Navbar'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-20 border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-display text-lg text-text">BeeCritic</p>
              <p className="mt-1 text-sm text-muted">© 2026 Demo Project</p>
            </div>
            <nav
              aria-label="Legal"
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted"
            >
              <Link to="/privacy" className="hover:text-accent">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="hover:text-accent">
                Cookie Policy
              </Link>
              <Link to="/terms" className="hover:text-accent">
                Terms of Service
              </Link>
              <Link to="/cookie-settings" className="hover:text-accent">
                Cookie Settings
              </Link>
            </nav>
          </div>
          <p className="text-xs text-muted">
            Movie data from TMDB. This product uses the TMDB API but is not endorsed by TMDB.
          </p>
        </div>
      </footer>
      <CookieConsentBanner />
    </div>
  )
}
