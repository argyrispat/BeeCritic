import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { tmdbApi } from '@/api/client'
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard'
import { EmptyState, ErrorState } from '@/components/States'
import { yearFromDate } from '@/lib/format'
import type { DiscoverSortBy, TmdbMovieSummary, TmdbPagedResponse } from '@/types'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i)

const SORT_OPTIONS: { value: DiscoverSortBy; label: string }[] = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Highest rated' },
  { value: 'primary_release_date.desc', label: 'Newest first' },
  { value: 'primary_release_date.asc', label: 'Oldest first' },
  { value: 'title.asc', label: 'Title A–Z' },
  { value: 'revenue.desc', label: 'Highest revenue' },
]

const RATING_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Any rating' },
  { value: '6', label: '6.0+' },
  { value: '7', label: '7.0+' },
  { value: '8', label: '8.0+' },
  { value: '9', label: '9.0+' },
]

function parseGenres(raw: string | null): number[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

function parseOptionalInt(raw: string | null): number | undefined {
  if (!raw) return undefined
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function movieMatchesFilters(
  movie: TmdbMovieSummary,
  genreIds: number[],
  yearFrom?: number,
  yearTo?: number,
  minRating?: number,
) {
  if (genreIds.length) {
    const ids = movie.genreIds ?? movie.genres?.map((g) => g.id) ?? []
    if (!genreIds.every((id) => ids.includes(id))) return false
  }

  const yearRaw = yearFromDate(movie.releaseDate)
  const year = yearRaw ? Number(yearRaw) : null
  if (yearFrom && (year == null || !Number.isFinite(year) || year < yearFrom)) return false
  if (yearTo && (year == null || !Number.isFinite(year) || year > yearTo)) return false
  if (minRating != null && movie.voteAverage < minRating) return false

  return true
}

function sortMovies(movies: TmdbMovieSummary[], sortBy: DiscoverSortBy): TmdbMovieSummary[] {
  const sorted = [...movies]
  const popularity = (m: TmdbMovieSummary) => m.popularity ?? 0
  const release = (m: TmdbMovieSummary) => m.releaseDate ?? ''

  switch (sortBy) {
    case 'popularity.asc':
      return sorted.sort((a, b) => popularity(a) - popularity(b))
    case 'vote_average.desc':
      return sorted.sort((a, b) => b.voteAverage - a.voteAverage || popularity(b) - popularity(a))
    case 'vote_average.asc':
      return sorted.sort((a, b) => a.voteAverage - b.voteAverage || popularity(b) - popularity(a))
    case 'primary_release_date.desc':
      return sorted.sort((a, b) => release(b).localeCompare(release(a)) || popularity(b) - popularity(a))
    case 'primary_release_date.asc':
      return sorted.sort((a, b) => release(a).localeCompare(release(b)) || popularity(b) - popularity(a))
    case 'title.asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'title.desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case 'revenue.desc':
      // Revenue isn't on search results; fall back to popularity.
      return sorted.sort((a, b) => popularity(b) - popularity(a))
    case 'popularity.desc':
    default:
      return sorted.sort((a, b) => popularity(b) - popularity(a))
  }
}

const selectClass =
  'w-full border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none focus:border-accent'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [debounced, setDebounced] = useState(initialQ)

  const page = Number(params.get('page') ?? '1') || 1
  const genreIds = useMemo(() => parseGenres(params.get('genres')), [params])
  const yearFrom = parseOptionalInt(params.get('yearFrom'))
  const yearTo = parseOptionalInt(params.get('yearTo'))
  const sortBy = (params.get('sort') as DiscoverSortBy | null) ?? 'popularity.desc'
  const minRating = parseOptionalInt(params.get('minRating'))

  const hasTextQuery = debounced.length > 0
  const hasFilters = genreIds.length > 0 || yearFrom != null || yearTo != null || minRating != null
  const singleYear =
    yearFrom != null && yearTo != null && yearFrom === yearTo
      ? yearFrom
      : yearFrom != null && yearTo == null
        ? yearFrom
        : yearTo != null && yearFrom == null
          ? yearTo
          : undefined

  const effectiveYearFrom =
    yearFrom != null && yearTo != null && yearFrom > yearTo ? yearTo : yearFrom
  const effectiveYearTo =
    yearFrom != null && yearTo != null && yearFrom > yearTo ? yearFrom : yearTo

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 350)
    return () => window.clearTimeout(id)
  }, [query])

  useEffect(() => {
    const next = new URLSearchParams(params)
    if (debounced) next.set('q', debounced)
    else next.delete('q')
    setParams(next, { replace: true })
    // Only sync debounced query into the URL; other filters write themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const genresQuery = useQuery({
    queryKey: ['tmdb', 'genres'],
    queryFn: () => tmdbApi.genres(),
    staleTime: 24 * 60 * 60 * 1000,
  })

  const resultsQuery = useQuery({
    queryKey: [
      'tmdb',
      hasTextQuery ? 'search' : 'discover',
      debounced,
      page,
      genreIds.join(','),
      effectiveYearFrom,
      effectiveYearTo,
      sortBy,
      minRating,
    ],
    queryFn: async (): Promise<TmdbPagedResponse> => {
      if (hasTextQuery) {
        const data = await tmdbApi.search(debounced, page, singleYear)
        const results =
          hasFilters && !(singleYear != null && !genreIds.length && minRating == null)
            ? data.results.filter((movie) =>
                movieMatchesFilters(movie, genreIds, effectiveYearFrom, effectiveYearTo, minRating),
              )
            : data.results
        return { ...data, results: sortMovies(results, sortBy) }
      }

      return tmdbApi.discover({
        page,
        withGenres: genreIds,
        year: singleYear,
        yearFrom: singleYear == null ? effectiveYearFrom : undefined,
        yearTo: singleYear == null ? effectiveYearTo : undefined,
        sortBy,
        minRating,
      })
    },
  })

  function updateFilters(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === '') next.delete(key)
      else next.set(key, value)
    }
    next.delete('page')
    setParams(next)
  }

  function toggleGenre(id: number) {
    const set = new Set(genreIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    const next = [...set].sort((a, b) => a - b)
    updateFilters({ genres: next.length ? next.join(',') : null })
  }

  function clearFilters() {
    setQuery('')
    setDebounced('')
    setParams(new URLSearchParams())
  }

  const activeFilterCount =
    genreIds.length +
    (yearFrom != null ? 1 : 0) +
    (yearTo != null && yearTo !== yearFrom ? 1 : 0) +
    (minRating != null ? 1 : 0) +
    (sortBy !== 'popularity.desc' ? 1 : 0)

  const selectedGenreNames =
    genresQuery.data?.filter((g) => genreIds.includes(g.id)).map((g) => g.name) ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Search</h1>
        <p className="mt-3 text-muted">
          Find films by title, or combine genre, year, rating, and sort.
        </p>
      </header>

      <div className="relative mb-6 max-w-xl">
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
          placeholder="Search by title…"
          className="w-full border border-border bg-surface py-3 pl-10 pr-4 text-text outline-none focus:border-accent"
          autoFocus
        />
      </div>

      <section className="mb-10 border border-border bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium tracking-wide text-muted uppercase">Filters</h2>
          {activeFilterCount > 0 || hasTextQuery ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"
            >
              <X size={14} />
              Clear all
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">Year from</span>
            <select
              className={selectClass}
              value={yearFrom ?? ''}
              onChange={(e) => updateFilters({ yearFrom: e.target.value || null })}
            >
              <option value="">Any</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">Year to</span>
            <select
              className={selectClass}
              value={yearTo ?? ''}
              onChange={(e) => updateFilters({ yearTo: e.target.value || null })}
            >
              <option value="">Any</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">Min rating</span>
            <select
              className={selectClass}
              value={minRating ?? ''}
              onChange={(e) => updateFilters({ minRating: e.target.value || null })}
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value || 'any'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">Sort by</span>
            <select
              className={selectClass}
              value={sortBy}
              onChange={(e) =>
                updateFilters({
                  sort: e.target.value === 'popularity.desc' ? null : e.target.value,
                })
              }
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs text-muted">Genres</p>
          {genresQuery.isError ? (
            <p className="text-sm text-danger">Couldn’t load genres.</p>
          ) : genresQuery.isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="h-8 w-20 animate-pulse bg-surface-2" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {genresQuery.data?.map((genre) => {
                const active = genreIds.includes(genre.id)
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleGenre(genre.id)}
                    aria-pressed={active}
                    className={
                      active
                        ? 'border border-accent bg-accent-soft px-3 py-1.5 text-sm text-text'
                        : 'border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-text'
                    }
                  >
                    {genre.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {(selectedGenreNames.length > 0 || yearFrom || yearTo || minRating) && (
          <p className="mt-4 text-sm text-muted">
            Combining
            {selectedGenreNames.length > 0 ? ` ${selectedGenreNames.join(' + ')}` : ''}
            {yearFrom || yearTo
              ? ` · ${yearFrom ?? '…'}–${yearTo ?? '…'}`
              : ''}
            {minRating != null ? ` · ${minRating}+ rating` : ''}
            {hasTextQuery ? ` · matching “${debounced}”` : ''}
          </p>
        )}
      </section>

      {resultsQuery.isError ? (
        <ErrorState
          message={resultsQuery.error instanceof Error ? resultsQuery.error.message : undefined}
          onRetry={() => resultsQuery.refetch()}
        />
      ) : resultsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : !resultsQuery.data?.results.length ? (
        <EmptyState
          title="No movies found"
          description={
            hasTextQuery
              ? 'Nothing matched these criteria. Try loosening a filter.'
              : 'No films for this combination. Try different genres or years.'
          }
        />
      ) : (
        <>
          <p className="mb-6 text-sm text-muted">
            {hasTextQuery && hasFilters
              ? `${resultsQuery.data.results.length} matches on this page`
              : `${resultsQuery.data.totalResults.toLocaleString()} results`}
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {resultsQuery.data.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          {resultsQuery.data.totalPages > 1 && (
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
                Page {page} of {resultsQuery.data.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= resultsQuery.data.totalPages}
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
