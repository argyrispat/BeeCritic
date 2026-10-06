import { Link } from 'react-router-dom'
import { posterUrl, yearFromDate } from '@/lib/format'
import type { TmdbMovieSummary } from '@/types'

interface MovieCardProps {
  movie: TmdbMovieSummary
  platformRating?: number | null
}

export function MovieCard({ movie, platformRating }: MovieCardProps) {
  const poster = posterUrl(movie.posterPath, 'w500')
  const year = yearFromDate(movie.releaseDate)
  const rating = platformRating ?? movie.voteAverage

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-surface-2">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted">
            No poster
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 opacity-0 transition duration-300 group-hover:opacity-100">
          <p className="line-clamp-2 text-sm font-medium text-white">{movie.title}</p>
          <p className="mt-1 text-xs text-white/70">
            {year ?? '—'}
            {rating > 0 ? ` · ${rating.toFixed(1)}` : ''}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <h3 className="line-clamp-2 font-display text-lg leading-snug text-text">{movie.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {year ?? 'TBA'}
          {rating > 0 ? ` · ★ ${rating.toFixed(1)}` : ''}
        </p>
      </div>
    </Link>
  )
}

export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-surface-2" />
      <div className="mt-3 h-5 w-3/4 rounded bg-surface-2" />
      <div className="mt-2 h-4 w-1/3 rounded bg-surface-2" />
    </div>
  )
}
