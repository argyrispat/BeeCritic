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

## TMDB integration

1. Create a free API key at [TMDB Settings → API](https://www.themoviedb.org/settings/api).
2. Configure it via environment variable or user secrets (never commit the key):

```bash
# PowerShell
$env:Tmdb__ApiKey="YOUR_TMDB_API_KEY"
```

```bash
# bash
export Tmdb__ApiKey=YOUR_TMDB_API_KEY
```

Or ASP.NET user secrets:

```bash
cd backend/BeeCritic.Api
dotnet user-secrets init
dotnet user-secrets set "Tmdb:ApiKey" "YOUR_TMDB_API_KEY"
```

Movie details, popular, and trending responses are memory-cached to reduce TMDB traffic.

## Authentication

- Registration requires username, email, password (+ confirm)
- Passwords hashed with BCrypt
- Login returns a JWT used as `Authorization: Bearer <token>`
- Ownership checks on review/comment mutations are enforced server-side

## Local development

### Prerequisites

- .NET 10 SDK
- Node.js 20+
- Docker (for PostgreSQL)
- TMDB API key

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Run the API

```bash
cd backend/BeeCritic.Api
# set Tmdb__ApiKey first
dotnet run
```

The API listens on `http://localhost:5080`, applies migrations, and seeds demo data on startup.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the backend.

## Deployment notes

- Set strong `Jwt:Key` (≥ 32 chars) and a production connection string
- Configure `Cors:FrontendOrigin` to your SPA origin
- Provide `Tmdb:ApiKey` via your host’s secret store
- Build frontend with `npm run build` and serve `dist/`
- Publish API with `dotnet publish -c Release`
- Run migrations against the production database (`dotnet ef database update`)

## Project structure (high level)

```
backend/BeeCritic.Api/
  Controllers/     Auth, Reviews, Comments, Users, TMDB
  Services/        Business logic + TmdbService
  Models/          User, Review, Comment
  Data/            AppDbContext, migrations, seeder
  DTOs/            Request/response contracts

frontend/src/
  pages/           Home, Movie, Search, Profile, Auth…
  components/      Navbar, MovieCard, ReviewForm…
  contexts/        Auth + Theme
  api/             Typed API client
```

## License

See [LICENSE](LICENSE).
