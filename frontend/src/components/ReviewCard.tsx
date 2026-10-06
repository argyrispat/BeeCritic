import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { RatingBadge } from '@/components/RatingSelector'
import { formatRelativeDate, truncate } from '@/lib/format'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
  movieTitle?: string
  href?: string
}

export function ReviewCard({ review, movieTitle, href }: ReviewCardProps) {
  const content = (
    <article className="border border-border bg-surface p-5 transition hover:border-accent/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RatingBadge rating={review.rating} />
        {movieTitle && <span className="text-sm text-muted">{movieTitle}</span>}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-text">
        “{truncate(review.content, 220)}”
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        <span>{review.username}</span>
        <span>·</span>
        <span>{formatRelativeDate(review.createdAt)}</span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle size={14} />
          {review.commentCount}
        </span>
      </div>
    </article>
  )

  if (href) {
    return (
      <Link to={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        {content}
      </Link>
    )
  }

  return content
}

export function ReviewCardSkeleton() {
  return (
    <div className="animate-pulse border border-border bg-surface p-5">
      <div className="h-6 w-20 rounded bg-surface-2" />
      <div className="mt-4 h-4 w-full rounded bg-surface-2" />
      <div className="mt-2 h-4 w-5/6 rounded bg-surface-2" />
      <div className="mt-4 h-3 w-40 rounded bg-surface-2" />
    </div>
  )
}
