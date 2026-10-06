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
        <div className="-mx-4 flex gap-6 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <ReviewScrollCardSkeleton key={i} />
          ))}
        </div>
      ) : !reviews?.length ? (
        <p className="text-muted">{emptyMessage ?? 'Nothing to show yet.'}</p>
      ) : (
        <div className="scroll-x -mx-4 flex gap-6 scroll-smooth px-4 pb-3 snap-x snap-mandatory sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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
      className="group flex h-44 w-[min(88vw,20.5rem)] shrink-0 snap-start items-stretch gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-[22rem]"
    >
      <div className="h-full w-28 shrink-0 overflow-hidden bg-surface-2">
        {poster ? (
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
            No poster
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h3 className="font-display text-lg leading-snug tracking-tight line-clamp-2 transition-colors group-hover:text-accent">
          {movieTitle ?? `Movie #${review.tmdbMovieId}`}
        </h3>
        <div className="mt-1.5">
          <RatingBadge rating={review.rating} size="sm" />
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-muted line-clamp-3">
          “{truncate(review.content, 110)}”
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="text-text/80">{review.username}</span>
          <span aria-hidden>·</span>
          <span>{formatRelativeDate(review.createdAt)}</span>
          <span aria-hidden>·</span>
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
    <div className="flex h-44 w-[min(88vw,20.5rem)] shrink-0 animate-pulse gap-4 sm:w-[22rem]">
      <div className="h-full w-28 shrink-0 bg-surface-2" />
      <div className="min-w-0 flex-1 py-0.5">
        <div className="h-5 w-3/4 rounded bg-surface-2" />
        <div className="mt-2 h-4 w-16 rounded bg-surface-2" />
        <div className="mt-3 h-4 w-full rounded bg-surface-2" />
        <div className="mt-2 h-4 w-5/6 rounded bg-surface-2" />
        <div className="mt-4 h-3 w-28 rounded bg-surface-2" />
      </div>
    </div>
  )
}
