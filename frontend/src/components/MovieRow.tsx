import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MovieCard, MovieCardSkeleton } from '@/components/MovieCard'
import type { TmdbMovieSummary } from '@/types'

interface MovieRowProps {
  title: string
  movies?: TmdbMovieSummary[]
  isLoading?: boolean
  platformRatings?: Record<number, number>
  emptyMessage?: string
  action?: ReactNode
}

export function MovieRow({
  title,
  movies,
  isLoading,
  platformRatings,
  emptyMessage,
  action,
}: MovieRowProps) {
  return (
    <section className="fade-in">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
        {action}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : !movies?.length ? (
        <p className="text-muted">{emptyMessage ?? 'Nothing to show yet.'}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              platformRating={platformRatings?.[movie.id]}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function SectionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-sm text-muted hover:text-accent">
      {children}
    </Link>
  )
}
