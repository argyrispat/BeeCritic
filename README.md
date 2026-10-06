# BeeCritic

A cinematic movie review platform where users discover films via [The Movie Database (TMDB)](https://www.themoviedb.org/), rate them from 1–10, write reviews, and comment on each other’s takes.

BeeCritic is a portfolio project: polished UI, real authentication, constrained data model, and clean API design — not a commercial product.

## Demo credentials

| Field    | Value                |
|----------|----------------------|
| Email    | `demo@beecritic.com` |
| Password | `Demo1234!`          |

Additional seeded users (same password): `maya_films`, `leo_reels`, `nora_cinema`, `kai_watches`.

## Features

- Cinematic home page with hero backdrop and curated movie rows
- TMDB-powered search, trending, popular, top rated, and now playing
- Movie detail pages with cast, director, ratings, and platform stats
- One review per user per movie (DB unique constraint + API validation)
- Visual 1–10 rating selector, edit/delete own reviews
- Review detail view with nested comments (edit/delete own comments)
- Paginated reviews and comments
- User profiles with review history
- JWT authentication, password hashing (BCrypt)
- Dark theme by default with light/dark toggle (localStorage + `prefers-color-scheme`)
- Skeleton loaders, empty states, and friendly error handling
- Responsive layout for desktop and mobile

## Tech stack

**Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form, Zod, Lucide

**Backend:** ASP.NET Core Web API, C#, Entity Framework Core, PostgreSQL, JWT, Swagger/OpenAPI

**External:** TMDB API (metadata & imagery only; BeeCritic stores TMDB movie IDs for relationships)

## Architecture

```
frontend/          React SPA (Vite)
backend/
  BeeCritic.Api/   REST API + EF Core + TMDB proxy
docker-compose.yml PostgreSQL
```

- The frontend never talks to TMDB directly; the API proxies and caches TMDB responses.
- Reviews/comments/users live in PostgreSQL.
- Controllers → services → `AppDbContext`; DTOs are returned instead of entities.

## Database design

```
User 1──* Review 1──* Comment
User 1──────────────* Comment

UNIQUE (Review.UserId, Review.TmdbMovieId)
CHECK  (Review.Rating BETWEEN 1 AND 10)
```

## API overview

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/tmdb/search?q=` | No |
| GET | `/api/tmdb/movies/{id}` | No |
| GET | `/api/tmdb/trending` | No |
| GET | `/api/tmdb/popular` | No |
| GET | `/api/tmdb/top-rated` | No |
| GET | `/api/tmdb/now-playing` | No |
| GET | `/api/movies/{id}/reviews` | No |
| GET | `/api/movies/{id}/stats` | No |
| GET | `/api/movies/{id}/my-review` | Yes |
| POST | `/api/movies/{id}/reviews` | Yes |
| GET | `/api/reviews/{id}` | No |
| PUT | `/api/reviews/{id}` | Yes (owner) |
| DELETE | `/api/reviews/{id}` | Yes (owner) |
| GET | `/api/reviews/{id}/comments` | No |
| POST | `/api/reviews/{id}/comments` | Yes |
| PUT | `/api/comments/{id}` | Yes (owner) |
| DELETE | `/api/comments/{id}` | Yes (owner) |
| GET | `/api/users/{username}` | No |
| GET | `/api/users/{username}/reviews` | No |
| GET | `/api/platform/popular-movies` | No |

Swagger UI: `http://localhost:5080/swagger`

## Authentication

- Registration requires username, email, password (+ confirm)
- Passwords hashed with BCrypt
- Login returns a JWT used as `Authorization: Bearer <token>`
- Ownership checks on review/comment mutations are enforced server-side

## Privacy & Security

BeeCritic is a **portfolio/demo application**. It is not intended for production use or for processing real customer data. Seeded users, reviews, and comments are fictional.

### What is implemented

- **Authentication:** passwords are hashed with BCrypt (never stored in plaintext); login/register return JWTs validated server-side
- **Authorization:** review and comment create/update/delete require a valid JWT; ownership is enforced in services (user id comes from the token, not the request body)
- **No roles / no tenants:** there is no role field to escalate; the app is a single shared demo space with per-user ownership of content
- **Data minimization:** accounts store username, email, password hash, and timestamps only — no government ID, DOB, gender, health data, or precise GPS
- **Errors:** API responses use user-friendly messages; stack traces and internal details are not returned in production
- **Logging:** passwords and JWT tokens are not intentionally logged
- **Legal pages (demo templates):** `/privacy`, `/cookies`, `/terms`, `/cookie-settings`
- **Cookie notice:** the app uses necessary `localStorage` for auth/theme/consent; analytics and advertising cookies are **not** used

Legal pages are demonstration templates and have **not** been reviewed by a lawyer.
