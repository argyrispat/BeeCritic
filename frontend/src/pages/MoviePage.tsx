import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reviewsApi, tmdbApi } from '@/api/client'
import { ReviewCard, ReviewCardSkeleton } from '@/components/ReviewCard'
import { ReviewForm } from '@/components/ReviewForm'
import { RatingBadge } from '@/components/RatingSelector'
import { EmptyState, ErrorState, PageLoader } from '@/components/States'
import { useAuth } from '@/contexts/AuthContext'
import { ApiError } from '@/lib/api'
import {
  backdropUrl,
  formatRelativeDate,
  formatRuntime,
  posterUrl,
  yearFromDate,
} from '@/lib/format'

export function MoviePage() {
  const { id } = useParams()
  const movieId = Number(id)
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? '1') || 1
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [writing, setWriting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const movie = useQuery({
    queryKey: ['tmdb', 'movie', movieId],
    enabled: Number.isFinite(movieId) && movieId > 0,
    queryFn: () => tmdbApi.movie(movieId),
    retry: 2,
    refetchOnMount: 'always',
  })

  const stats = useQuery({
    queryKey: ['stats', movieId],
    enabled: Number.isFinite(movieId),
    queryFn: () => reviewsApi.stats(movieId),
  })

  const reviews = useQuery({
    queryKey: ['reviews', movieId, page],
    enabled: Number.isFinite(movieId),
    queryFn: () => reviewsApi.byMovie(movieId, page, 10),
  })

  const myReview = useQuery({
    queryKey: ['my-review', movieId],
    enabled: isAuthenticated && Number.isFinite(movieId),
    queryFn: () => reviewsApi.myReview(movieId),
    retry: false,
  })

  const createMutation = useMutation({
    mutationFn: (values: { rating: number; content: string }) =>
      reviewsApi.create(movieId, values),
    onSuccess: async () => {
      setWriting(false)
      await invalidate()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: { rating: number; content: string }) =>
      reviewsApi.update(myReview.data!.id, values),
    onSuccess: async () => {
      setEditing(false)
      await invalidate()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => reviewsApi.remove(myReview.data!.id),
    onSuccess: async () => {
      setConfirmDelete(false)
      setEditing(false)
      await invalidate()
    },
  })

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['reviews', movieId] }),
      queryClient.invalidateQueries({ queryKey: ['stats', movieId] }),
      queryClient.invalidateQueries({ queryKey: ['my-review', movieId] }),
      queryClient.invalidateQueries({ queryKey: ['platform', 'popular'] }),
    ])
  }

  if (!Number.isFinite(movieId) || movieId <= 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ErrorState title="Invalid movie" />
      </div>
    )
  }

  if (movie.isLoading || movie.isPending) return <PageLoader />

  if (movie.isError || !movie.data) {
    const apiError = movie.error instanceof ApiError ? movie.error : null
    const isMissing = apiError?.status === 404
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <ErrorState
          title={isMissing ? 'Movie not found' : 'Couldn’t load this movie'}
          message={
            apiError?.message ??
            'Something went wrong while loading movie details.'
          }
          onRetry={() => movie.refetch()}
        />
      </div>
    )
  }

  const m = movie.data
  const year = yearFromDate(m.releaseDate)
  const runtime = formatRuntime(m.runtime)
  const director = m.credits?.crew.find((c) => c.job === 'Director')
  const cast = m.credits?.cast.slice(0, 8) ?? []
  const genreLabel = m.genres?.map((g) => g.name).join(', ')
  const hasMyReview = Boolean(myReview.data)
  const myReviewMissing =
    myReview.isError && myReview.error instanceof ApiError && myReview.error.status === 404

  return (
    <div className="fade-in">
      <section className="relative min-h-[55vh] overflow-hidden">
        {m.backdropPath && (
          <img
            src={backdropUrl(m.backdropPath) ?? undefined}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-black/50" />
        <div className="relative mx-auto flex min-h-[55vh] max-w-7xl items-end px-4 pb-12 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl tracking-tight sm:text-6xl">{m.title}</h1>
            <p className="mt-4 text-sm text-muted sm:text-base">
              {[year, genreLabel, runtime].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {stats.data?.averageRating != null && (
                <span className="text-accent">★ {stats.data.averageRating}/10 BeeCritic</span>
              )}
              <span className="text-muted">TMDB {m.voteAverage.toFixed(1)}/10</span>
              <span className="text-muted">
                {stats.data?.reviewCount ?? 0}{' '}
                {(stats.data?.reviewCount ?? 0) === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            {m.overview && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-text/90">{m.overview}</p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
          <div>
            {m.posterPath ? (
              <img
                src={posterUrl(m.posterPath, 'w500') ?? undefined}
                alt={m.title}
                className="w-full shadow-lg shadow-black/30"
              />
            ) : (
              <div className="aspect-[2/3] bg-surface-2" />
            )}
          </div>

          <div className="space-y-10">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Director</h2>
                <p className="mt-2 text-lg">{director?.name ?? '—'}</p>
              </div>
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Cast</h2>
                <ul className="mt-2 space-y-1 text-lg">
                  {cast.length
                    ? cast.map((c) => <li key={c.id}>{c.name}</li>)
                    : <li>—</li>}
                </ul>
              </div>
            </div>

            <section className="border-t border-border pt-10">
              <h2 className="font-display text-3xl">Your Review</h2>

              {!isAuthenticated ? (
                <p className="mt-4 text-muted">
                  <Link to="/signin" className="text-accent hover:underline">
                    Sign in
                  </Link>{' '}
                  to rate and review this movie.
                </p>
              ) : hasMyReview && myReview.data && !editing ? (
                <div className="mt-6 border border-border bg-surface p-5">
                  <RatingBadge rating={myReview.data.rating} />
                  <p className="mt-4 leading-relaxed">“{myReview.data.content}”</p>
                  <p className="mt-3 text-sm text-muted">
                    Updated {formatRelativeDate(myReview.data.updatedAt)}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="border border-border px-4 py-2 text-sm hover:border-accent"
                    >
                      Edit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="border border-border px-4 py-2 text-sm text-danger hover:border-danger"
                    >
                      Delete
                    </button>
                  </div>
                  {confirmDelete && (
                    <div className="mt-4 border border-border bg-surface-2 p-4">
                      <p className="text-sm">Delete this review?</p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate()}
                          className="bg-danger px-3 py-1.5 text-sm text-white"
                        >
                          {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="border border-border px-3 py-1.5 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (hasMyReview && editing) || writing ? (
                <div className="mt-6">
                  <ReviewForm
                    initialRating={myReview.data?.rating ?? 0}
                    initialContent={myReview.data?.content ?? ''}
                    submitLabel={editing ? 'Save Changes' : 'Submit Review'}
                    onCancel={() => {
                      setEditing(false)
                      setWriting(false)
                    }}
                    onSubmit={async (values) => {
                      if (editing) await updateMutation.mutateAsync(values)
                      else await createMutation.mutateAsync(values)
                    }}
                  />
                </div>
              ) : myReviewMissing || (!myReview.isLoading && !hasMyReview) ? (
                <div className="mt-6">
                  {!writing ? (
                    <button
                      type="button"
                      onClick={() => setWriting(true)}
                      className="bg-accent px-5 py-2.5 text-sm font-medium text-bg"
                    >
                      Write a Review
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="mt-6 h-24 animate-pulse bg-surface-2" />
              )}
            </section>
          </div>
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-3xl">User Reviews</h2>

          {reviews.isLoading ? (
            <div className="mt-8 grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : reviews.isError ? (
            <div className="mt-8">
              <ErrorState onRetry={() => reviews.refetch()} />
            </div>
          ) : !reviews.data?.items.length ? (
            <div className="mt-8">
              <EmptyState
                title="No reviews yet."
                description="Be the first person to share your thoughts about this movie."
                action={
                  isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => setWriting(true)}
                      className="bg-accent px-5 py-2.5 text-sm font-medium text-bg"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <Link to="/signin" className="bg-accent px-5 py-2.5 text-sm font-medium text-bg">
                      Sign in to review
                    </Link>
                  )
                }
              />
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-4">
                {reviews.data.items.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    href={`/movie/${movieId}/reviews/${review.id}`}
                  />
                ))}
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
    </div>
  )
}
