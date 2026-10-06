import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { RatingBadge } from '@/components/RatingSelector'
import { formatRelativeDate, posterUrl, truncate } from '@/lib/format'
import type { Review, TmdbMovieDetails } from '@/types'

interface ReviewRowProps {
  title: string
  reviews?: Review[]
  moviesById?: Record<number, TmdbMovieDetails | undefined>
  isLoading?: boolean
  emptyMessage?: string
}

export function ReviewRow({
  title,
  reviews,
  moviesById,
  isLoading,
  emptyMessage,
}: ReviewRowProps) {
  return (
    <section className="fade-in">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <ReviewScrollCardSkeleton key={i} />
          ))}
        </div>
      ) : !reviews?.length ? (
        <p className="text-muted">{emptyMessage ?? 'Nothing to show yet.'}</p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 scroll-smooth sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:thin]">
          <div className="flex w-max gap-4">
            {reviews.map((review) => {
              const movie = moviesById?.[review.tmdbMovieId]
              return (
                <ReviewScrollCard
                  key={review.id}
                  review={review}
                  movieTitle={movie?.title}
                  posterPath={movie?.posterPath}
                />
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

function ReviewScrollCard({
  review,
  movieTitle,
  posterPath,
}: {
  review: Review
  movieTitle?: string
  posterPath?: string | null
}) {
  const poster = posterUrl(posterPath, 'w342')

  return (
    <Link
      to={`/movie/${review.tmdbMovieId}/reviews/${review.id}`}
      className="group flex w-[min(85vw,22rem)] shrink-0 gap-4 border border-border bg-surface p-4 transition hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-96"
    >
      <div className="h-36 w-24 shrink-0 overflow-hidden bg-surface-2">
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
            No poster
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-snug line-clamp-2">
            {movieTitle ?? `Movie #${review.tmdbMovieId}`}
          </h3>
          <RatingBadge rating={review.rating} size="sm" />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-3">
          “{truncate(review.content, 120)}”
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span>{review.username}</span>
          <span>·</span>
          <span>{formatRelativeDate(review.createdAt)}</span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={12} />
            {review.commentCount}
          </span>
        </div>
      </div>
    </Link>
  )
}

function ReviewScrollCardSkeleton() {
  return (
    <div className="flex w-[min(85vw,22rem)] shrink-0 animate-pulse gap-4 border border-border bg-surface p-4 sm:w-96">
      <div className="h-36 w-24 shrink-0 bg-surface-2" />
      <div className="min-w-0 flex-1">
        <div className="h-5 w-3/4 rounded bg-surface-2" />
        <div className="mt-3 h-4 w-full rounded bg-surface-2" />
        <div className="mt-2 h-4 w-5/6 rounded bg-surface-2" />
        <div className="mt-4 h-3 w-32 rounded bg-surface-2" />
      </div>
    </div>
  )
}
