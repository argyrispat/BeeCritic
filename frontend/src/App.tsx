import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/Layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { CookieConsentProvider } from '@/contexts/CookieConsentContext'
import { CookieSettingsPage } from '@/pages/CookieSettingsPage'
import { CookiesPage } from '@/pages/CookiesPage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { HomePage } from '@/pages/HomePage'
import { MoviePage } from '@/pages/MoviePage'
import { MoviesPage } from '@/pages/MoviesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ReviewDetailPage } from '@/pages/ReviewDetailPage'
import { SearchPage } from '@/pages/SearchPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { TermsPage } from '@/pages/TermsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CookieConsentProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="movies" element={<MoviesPage />} />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="movie/:id" element={<MoviePage />} />
                <Route
                  path="movie/:movieId/reviews/:reviewId"
                  element={<ReviewDetailPage />}
                />
                <Route path="u/:username" element={<ProfilePage />} />
                <Route path="signin" element={<SignInPage />} />
                <Route path="signup" element={<SignUpPage />} />
                <Route path="login" element={<Navigate to="/signin" replace />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="cookies" element={<CookiesPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="cookie-settings" element={<CookieSettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CookieConsentProvider>
    </QueryClientProvider>
  )
}
