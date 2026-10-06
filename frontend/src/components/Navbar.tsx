import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm tracking-wide ${isActive ? 'text-text' : 'text-muted hover:text-text'}`

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-2xl tracking-tight text-text" onClick={close}>
          Bee<span className="text-accent">Critic</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/movies" className={linkClass}>
            Movies
          </NavLink>
          <NavLink to="/discover" className={linkClass}>
            Discover
          </NavLink>
          <NavLink to="/search" className={linkClass}>
            Search
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-border p-2 text-muted hover:text-text"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated && user ? (
            <>
              <Link
                to={`/u/${user.username}`}
                className="text-sm text-muted hover:text-text"
              >
                {user.username}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="text-sm text-muted hover:text-text"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-sm text-muted hover:text-text">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link to="/search" className="rounded-md border border-border p-2 text-muted" aria-label="Search">
            <Search size={16} />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md border border-border p-2 text-muted"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border p-2 text-muted"
            aria-label="Menu"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-bg px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <NavLink to="/movies" className={linkClass} onClick={close}>
              Movies
            </NavLink>
            <NavLink to="/discover" className={linkClass} onClick={close}>
              Discover
            </NavLink>
            <NavLink to="/search" className={linkClass} onClick={close}>
              Search
            </NavLink>
            {isAuthenticated && user ? (
              <>
                <NavLink to={`/u/${user.username}`} className={linkClass} onClick={close}>
                  Profile
                </NavLink>
                <button
                  type="button"
                  className="text-left text-sm text-muted"
                  onClick={() => {
                    logout()
                    close()
                    navigate('/')
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/signin" className={linkClass} onClick={close}>
                  Sign in
                </NavLink>
                <NavLink to="/signup" className={linkClass} onClick={close}>
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
