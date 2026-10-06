import { apiFetch } from '@/lib/api'
import type {
  AuthResponse,
  Comment,
  MovieStats,
  PagedResult,
  PopularMovie,
  Review,
  TmdbMovieDetails,
  TmdbPagedResponse,
  UserProfile,
} from '@/types'

export const authApi = {
  register: (body: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

export const tmdbApi = {
  search: (q: string, page = 1) =>
    apiFetch<TmdbPagedResponse>(`/api/tmdb/search?q=${encodeURIComponent(q)}&page=${page}`),
  movie: (id: number) => apiFetch<TmdbMovieDetails>(`/api/tmdb/movies/${id}`),
  trending: (page = 1) => apiFetch<TmdbPagedResponse>(`/api/tmdb/trending?page=${page}`),
  popular: (page = 1) => apiFetch<TmdbPagedResponse>(`/api/tmdb/popular?page=${page}`),
  topRated: (page = 1) => apiFetch<TmdbPagedResponse>(`/api/tmdb/top-rated?page=${page}`),
  nowPlaying: (page = 1) => apiFetch<TmdbPagedResponse>(`/api/tmdb/now-playing?page=${page}`),
  similar: (id: number, page = 1) =>
    apiFetch<TmdbPagedResponse>(`/api/tmdb/movies/${id}/similar?page=${page}`),
}

export const reviewsApi = {
  byMovie: (movieId: number, page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Review>>(
      `/api/movies/${movieId}/reviews?page=${page}&pageSize=${pageSize}`,
    ),
  stats: (movieId: number) => apiFetch<MovieStats>(`/api/movies/${movieId}/stats`),
  myReview: (movieId: number) => apiFetch<Review>(`/api/movies/${movieId}/my-review`),
  get: (id: string) => apiFetch<Review>(`/api/reviews/${id}`),
  create: (movieId: number, body: { rating: number; content: string }) =>
    apiFetch<Review>(`/api/movies/${movieId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { rating: number; content: string }) =>
    apiFetch<Review>(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    apiFetch<void>(`/api/reviews/${id}`, { method: 'DELETE' }),
  popularOnPlatform: (limit = 12) =>
    apiFetch<PopularMovie[]>(`/api/platform/popular-movies?limit=${limit}`),
  recent: (limit = 12) =>
    apiFetch<Review[]>(`/api/platform/recent-reviews?limit=${limit}`),
}

export const commentsApi = {
  byReview: (reviewId: string, page = 1, pageSize = 20) =>
    apiFetch<PagedResult<Comment>>(
      `/api/reviews/${reviewId}/comments?page=${page}&pageSize=${pageSize}`,
    ),
  create: (reviewId: string, content: string) =>
    apiFetch<Comment>(`/api/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  update: (id: string, content: string) =>
    apiFetch<Comment>(`/api/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
  remove: (id: string) =>
    apiFetch<void>(`/api/comments/${id}`, { method: 'DELETE' }),
}

export const usersApi = {
  profile: (username: string) => apiFetch<UserProfile>(`/api/users/${username}`),
  reviews: (username: string, page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Review>>(
      `/api/users/${username}/reviews?page=${page}&pageSize=${pageSize}`,
    ),
}
