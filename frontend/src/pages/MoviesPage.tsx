import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/api/client'
import { MovieRow } from '@/components/MovieRow'
import { ErrorState } from '@/components/States'

export function MoviesPage() {
  const popular = useQuery({ queryKey: ['tmdb', 'popular', 1], queryFn: () => tmdbApi.popular(1) })
  const topRated = useQuery({
    queryKey: ['tmdb', 'top-rated', 1],
    queryFn: () => tmdbApi.topRated(1),
  })
  const nowPlaying = useQuery({
    queryKey: ['tmdb', 'now-playing', 1],
    queryFn: () => tmdbApi.nowPlaying(1),
  })

  if (popular.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ErrorState onRetry={() => popular.refetch()} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Movies</h1>
        <p className="mt-3 text-muted">
          Browse what’s popular, critically celebrated, and newly released.
        </p>
      </header>
      <MovieRow title="Popular" movies={popular.data?.results} isLoading={popular.isLoading} />
      <MovieRow title="Top Rated" movies={topRated.data?.results} isLoading={topRated.isLoading} />
      <MovieRow
        title="Now Playing"
        movies={nowPlaying.data?.results}
        isLoading={nowPlaying.isLoading}
      />
    </div>
  )
}
