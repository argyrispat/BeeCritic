export interface AuthResponse {
  token: string
  userId: string
  username: string
  email: string
}

export interface UserProfile {
  id: string
  username: string
  createdAt: string
  reviewCount: number
}

export interface Review {
  id: string
  userId: string
  username: string
  tmdbMovieId: number
  rating: number
  content: string
  createdAt: string
  updatedAt: string
  commentCount: number
}

export interface Comment {
  id: string
  reviewId: string
  userId: string
  username: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface MovieStats {
  tmdbMovieId: number
  averageRating: number | null
  reviewCount: number
}

export interface PopularMovie {
  tmdbMovieId: number
  averageRating: number
  reviewCount: number
}

export interface TmdbGenre {
  id: number
  name: string
}

export interface TmdbMovieSummary {
  id: number
  title: string
  overview?: string | null
  posterPath?: string | null
  backdropPath?: string | null
  releaseDate?: string | null
  voteAverage: number
  voteCount: number
  genreIds?: number[] | null
  genres?: TmdbGenre[] | null
}

export interface TmdbCastMember {
  id: number
  name: string
  character?: string | null
  profilePath?: string | null
  order: number
}

export interface TmdbCrewMember {
  id: number
  name: string
  job: string
  department: string
  profilePath?: string | null
}

export interface TmdbCredits {
  cast: TmdbCastMember[]
  crew: TmdbCrewMember[]
}

export interface TmdbMovieDetails {
  id: number
  title: string
  overview?: string | null
  posterPath?: string | null
  backdropPath?: string | null
  releaseDate?: string | null
  runtime?: number | null
  voteAverage: number
  voteCount: number
  tagline?: string | null
  status?: string | null
  genres: TmdbGenre[]
  credits?: TmdbCredits | null
}

export interface TmdbPagedResponse {
  page: number
  results: TmdbMovieSummary[]
  totalPages: number
  totalResults: number
}

export interface ApiErrorBody {
  message: string
  errors?: Record<string, string[]>
}
