import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/api/client'
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard'
import { ErrorState } from '@/components/States'

export function DiscoverPage() {
  const trending = useQuery({
    queryKey: ['tmdb', 'trending', 'discover'],
    queryFn: () => tmdbApi.trending(1),
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Discover</h1>
        <p className="mt-3 text-muted">Films gaining attention this week.</p>
      </header>

      {trending.isError ? (
        <ErrorState
          message={trending.error instanceof Error ? trending.error.message : undefined}
          onRetry={() => trending.refetch()}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {trending.isLoading
            ? Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : trending.data?.results.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
        </div>
      )}
    </div>
  )
}
