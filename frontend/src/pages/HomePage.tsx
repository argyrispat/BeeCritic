import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { reviewsApi, tmdbApi } from '@/api/client'
import { MovieRow, SectionLink } from '@/components/MovieRow'
import { ReviewRow } from '@/components/ReviewRow'
import { ErrorState } from '@/components/States'
import { backdropUrl, yearFromDate } from '@/lib/format'
import type { TmdbMovieDetails, TmdbMovieSummary } from '@/types'

export function HomePage() {
  const trending = useQuery({ queryKey: ['tmdb', 'trending'], queryFn: () => tmdbApi.trending() })
  const popular = useQuery({ queryKey: ['tmdb', 'popular'], queryFn: () => tmdbApi.popular() })
  const topRated = useQuery({ queryKey: ['tmdb', 'top-rated'], queryFn: () => tmdbApi.topRated() })
  const nowPlaying = useQuery({
    queryKey: ['tmdb', 'now-playing'],
    queryFn: () => tmdbApi.nowPlaying(),
  })
  const platformPopular = useQuery({
    queryKey: ['platform', 'popular'],
    queryFn: () => reviewsApi.popularOnPlatform(12),
  })
  const recentReviews = useQuery({
    queryKey: ['platform', 'recent-reviews'],
    queryFn: () => reviewsApi.recent(12),
  })

  const recentMovieIds = [
    ...new Set((recentReviews.data ?? []).map((r) => r.tmdbMovieId)),
  ]

  const recentMovieQueries = useQueries({
    queries: recentMovieIds.map((id) => ({
      queryKey: ['tmdb', 'movie', id],
      queryFn: () => tmdbApi.movie(id),
      enabled: recentReviews.isSuccess,
    })),
  })

  const moviesById = Object.fromEntries(
    recentMovieIds.map((id, index) => [id, recentMovieQueries[index]?.data as TmdbMovieDetails | undefined]),
  )

  const platformMovieQueries = useQuery({
    queryKey: ['platform', 'popular-movies', platformPopular.data?.map((m) => m.tmdbMovieId)],
    enabled: Boolean(platformPopular.data?.length),
    queryFn: async () => {
      const items = platformPopular.data ?? []
      const movies = await Promise.all(
        items.map(async (item): Promise<TmdbMovieSummary | null> => {
          try {
            const details = await tmdbApi.movie(item.tmdbMovieId)
            return {
              id: details.id,
              title: details.title,
              overview: details.overview,
              posterPath: details.posterPath,
              backdropPath: details.backdropPath,
              releaseDate: details.releaseDate,
              voteAverage: item.averageRating,
              voteCount: item.reviewCount,
              genres: details.genres,
            }
          } catch {
            return null
          }
        }),
      )
      return movies.filter((m): m is TmdbMovieSummary => m !== null)
    },
  })

  const hero = trending.data?.results.find((m) => m.backdropPath) ?? trending.data?.results[0]
  const heroBackdrop = backdropUrl(hero?.backdropPath)
  const heroYear = yearFromDate(hero?.releaseDate)

  if (trending.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState
          title="Couldn’t load movies"
          message={trending.error instanceof Error ? trending.error.message : undefined}
          onRetry={() => trending.refetch()}
        />
      </div>
    )
  }

  return (
    <div>
      <section className="relative min-h-[78vh] overflow-hidden">
        {heroBackdrop && (
          <img
            src={heroBackdrop}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-black/40" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          {hero ? (
            <div className="max-w-2xl slide-up text-white">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/60">Featured</p>
              <h1 className="font-display text-5xl leading-none tracking-tight sm:text-6xl lg:text-7xl">
                {hero.title}
              </h1>
              <p className="mt-4 text-sm text-white/70">
                {[heroYear, hero.voteAverage > 0 ? `★ ${hero.voteAverage.toFixed(1)}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {hero.overview && (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 line-clamp-3">
                  {hero.overview}
                </p>
              )}
              <Link
                to={`/movie/${hero.id}`}
                className="mt-8 inline-block bg-accent px-6 py-3 text-sm font-medium text-bg hover:opacity-90"
              >
                View Movie
              </Link>
            </div>
          ) : (
            <div className="h-40 w-full max-w-xl animate-pulse bg-white/10" />
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        <MovieRow
          title="Trending"
          movies={trending.data?.results.slice(0, 12)}
          isLoading={trending.isLoading}
          action={<SectionLink to="/discover">See all</SectionLink>}
        />
        <ReviewRow
          title="Recent Reviews"
          reviews={recentReviews.data}
          moviesById={moviesById}
          isLoading={recentReviews.isLoading}
          emptyMessage="No community reviews yet. Be the first to rate a film."
        />
        <MovieRow
          title="Popular"
          movies={popular.data?.results.slice(0, 12)}
          isLoading={popular.isLoading}
        />
        <MovieRow
          title="Top Rated"
          movies={topRated.data?.results.slice(0, 12)}
          isLoading={topRated.isLoading}
        />
        <MovieRow
          title="Recently Released"
          movies={nowPlaying.data?.results.slice(0, 12)}
          isLoading={nowPlaying.isLoading}
        />
        <MovieRow
          title="Popular on BeeCritic"
          movies={platformMovieQueries.data}
          isLoading={platformPopular.isLoading || platformMovieQueries.isLoading}
          emptyMessage="No community reviews yet. Be the first to rate a film."
          platformRatings={Object.fromEntries(
            (platformPopular.data ?? []).map((m) => [m.tmdbMovieId, m.averageRating]),
          )}
        />
      </div>
    </div>
  )
}
