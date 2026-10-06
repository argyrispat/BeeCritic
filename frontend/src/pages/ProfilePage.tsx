import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import { tmdbApi, usersApi } from '@/api/client'
import { RatingBadge } from '@/components/RatingSelector'
import { EmptyState, ErrorState, PageLoader } from '@/components/States'
import { VoteCounts } from '@/components/VoteButtons'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import { formatMemberSince, formatRelativeDate, posterUrl, truncate } from '@/lib/format'

export function ProfilePage() {
  const { username } = useParams()
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? '1') || 1
  const { user } = useAuth()

  const profile = useQuery({
    queryKey: ['user', username],
    enabled: Boolean(username),
    queryFn: () => usersApi.profile(username!),
  })

  const reviews = useQuery({
    queryKey: ['user-reviews', username, page],
    enabled: Boolean(username),
    queryFn: () => usersApi.reviews(username!, page, 10),
  })

  const movieQueries = useQueries({
    queries: (reviews.data?.items ?? []).map((review) => ({
      queryKey: ['tmdb', 'movie', review.tmdbMovieId],
      queryFn: () => tmdbApi.movie(review.tmdbMovieId),
      staleTime: 1000 * 60 * 30,
    })),
  })

  if (profile.isLoading) return <PageLoader />

  if (profile.isError || !profile.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title="User not found"
          message={profile.error instanceof ApiError ? profile.error.message : undefined}
        />
      </div>
    )
  }

  const isOwn = user?.username.toLowerCase() === profile.data.username.toLowerCase()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 fade-in">
      <header className="border-b border-border pb-10 text-center">
        <h1 className="font-display text-4xl sm:text-5xl">{profile.data.username}</h1>
        <p className="mt-3 text-muted">
          Member since {formatMemberSince(profile.data.createdAt)}
        </p>
        <p className="mt-2 text-lg text-text">
          {profile.data.reviewCount}{' '}
          {profile.data.reviewCount === 1 ? 'Review' : 'Reviews'}
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-display text-3xl">
          {isOwn ? 'My Reviews' : 'Reviews'}
        </h2>

        {reviews.isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse bg-surface-2" />
            ))}
          </div>
        ) : reviews.isError ? (
          <div className="mt-8">
            <ErrorState onRetry={() => reviews.refetch()} />
          </div>
        ) : !reviews.data?.items.length ? (
          <div className="mt-8">
            <EmptyState
              title={isOwn ? "You haven't reviewed any movies yet." : 'No reviews yet.'}
              action={
                isOwn ? (
                  <Link to="/discover" className="bg-accent px-5 py-2.5 text-sm font-medium text-bg">
                    Discover Movies
                  </Link>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              {reviews.data.items.map((review, index) => {
                const movie = movieQueries[index]?.data
                return (
                  <Link
                    key={review.id}
                    to={`/movie/${review.tmdbMovieId}/reviews/${review.id}`}
                    className="flex gap-4 border border-border bg-surface p-4 transition hover:border-accent/50 sm:p-5"
                  >
                    <div className="h-28 w-20 shrink-0 overflow-hidden bg-surface-2">
                      {movie?.posterPath ? (
                        <img
                          src={posterUrl(movie.posterPath, 'w342') ?? undefined}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full animate-pulse bg-surface-2" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-display text-xl">
                          {movie?.title ?? `Movie #${review.tmdbMovieId}`}
                        </h3>
                        <RatingBadge rating={review.rating} size="sm" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        “{truncate(review.content, 140)}”
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span>{formatRelativeDate(review.createdAt)}</span>
                        <VoteCounts
                          upvoteCount={review.upvoteCount}
                          downvoteCount={review.downvoteCount}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {reviews.data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setParams({ page: String(page - 1) })}
                  className="border border-border px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-muted">
                  Page {page} of {reviews.data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= reviews.data.totalPages}
                  onClick={() => setParams({ page: String(page + 1) })}
                  className="border border-border px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
