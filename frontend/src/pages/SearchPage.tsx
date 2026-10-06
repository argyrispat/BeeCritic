import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { tmdbApi } from '@/api/client'
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard'
import { EmptyState, ErrorState } from '@/components/States'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('q') ?? ''
  const [query, setQuery] = useState(initial)
  const [debounced, setDebounced] = useState(initial)
  const page = Number(params.get('page') ?? '1') || 1

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 350)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    const next = new URLSearchParams()
    if (debounced) next.set('q', debounced)
    if (page > 1) next.set('page', String(page))
    setParams(next, { replace: true })
  }, [debounced, page, setParams])

  const search = useQuery({
    queryKey: ['tmdb', 'search', debounced, page],
    enabled: debounced.length > 0,
    queryFn: () => tmdbApi.search(debounced, page),
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Search</h1>
        <p className="mt-3 text-muted">Find a film by title.</p>
      </header>

      <div className="relative mb-10 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (page !== 1) {
              const next = new URLSearchParams(params)
              next.delete('page')
              setParams(next)
            }
          }}
          placeholder="Search movies…"
          className="w-full border border-border bg-surface py-3 pl-10 pr-4 text-text outline-none focus:border-accent"
          autoFocus
        />
      </div>

      {!debounced ? (
        <EmptyState title="Start typing" description="Results appear as you search." />
      ) : search.isError ? (
        <ErrorState
          message={search.error instanceof Error ? search.error.message : undefined}
          onRetry={() => search.refetch()}
        />
      ) : search.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : !search.data?.results.length ? (
        <EmptyState
          title="No movies found"
          description={`Nothing matched “${debounced}”. Try another title.`}
        />
      ) : (
        <>
          <p className="mb-6 text-sm text-muted">
            {search.data.totalResults.toLocaleString()} results
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {search.data.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          {search.data.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.set('page', String(page - 1))
                  setParams(next)
                }}
                className="border border-border px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {page} of {search.data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= search.data.totalPages}
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.set('page', String(page + 1))
                  setParams(next)
                }}
                className="border border-border px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
