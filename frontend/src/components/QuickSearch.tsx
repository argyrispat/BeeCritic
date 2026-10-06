import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { tmdbApi } from '@/api/client'
import { posterUrl, yearFromDate } from '@/lib/format'
import type { TmdbMovieSummary } from '@/types'

function byPopularity(a: TmdbMovieSummary, b: TmdbMovieSummary) {
  return (b.popularity ?? 0) - (a.popularity ?? 0)
}

export function QuickSearch() {
  const navigate = useNavigate()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 280)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const search = useQuery({
    queryKey: ['tmdb', 'quick-search', debounced],
    enabled: debounced.length > 0,
    queryFn: async () => {
      const data = await tmdbApi.search(debounced, 1)
      return [...data.results].sort(byPopularity).slice(0, 8)
    },
  })

  const showPanel = open && debounced.length > 0

  function goAdvanced(q: string) {
    setOpen(false)
    setQuery('')
    setDebounced('')
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const q = query.trim()
          if (!q) return
          goAdvanced(q)
        }}
      >
        <label className="sr-only" htmlFor={`${listId}-input`}>
          Quick search by title
        </label>
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          size={15}
        />
        <input
          id={`${listId}-input`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder="Quick search…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          className="w-full border border-border bg-surface py-2 pl-8 pr-3 text-sm text-text outline-none focus:border-accent"
        />
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 border border-border bg-surface shadow-lg"
        >
          {search.isLoading ? (
            <p className="px-3 py-3 text-sm text-muted">Searching…</p>
          ) : search.isError ? (
            <p className="px-3 py-3 text-sm text-danger">Couldn’t search right now.</p>
          ) : !search.data?.length ? (
            <p className="px-3 py-3 text-sm text-muted">No movies found.</p>
          ) : (
            <ul>
              {search.data.map((movie) => {
                const poster = posterUrl(movie.posterPath, 'w342')
                const year = yearFromDate(movie.releaseDate)
                return (
                  <li key={movie.id} role="option">
                    <Link
                      to={`/movie/${movie.id}`}
                      onClick={() => {
                        setOpen(false)
                        setQuery('')
                        setDebounced('')
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-surface-2"
                    >
                      <div className="h-12 w-8 shrink-0 overflow-hidden bg-surface-2">
                        {poster ? (
                          <img src={poster} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-text">{movie.title}</p>
                        <p className="text-xs text-muted">{year ?? 'TBA'}</p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <button
            type="button"
            onClick={() => goAdvanced(debounced)}
            className="block w-full border-t border-border px-3 py-2.5 text-left text-sm text-accent hover:bg-surface-2"
          >
            Advanced search for “{debounced}”
          </button>
        </div>
      )}
    </div>
  )
}
