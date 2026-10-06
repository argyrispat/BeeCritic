import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'

export function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="mt-20 border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            <span className="font-display text-text">BeeCritic</span> — cinematic reviews, thoughtfully made.
          </p>
          <p>Movie data from TMDB. This product uses the TMDB API but is not endorsed by TMDB.</p>
        </div>
      </footer>
    </div>
  )
}
