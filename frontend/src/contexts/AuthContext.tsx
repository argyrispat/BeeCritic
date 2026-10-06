import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/client'
import type { AuthResponse } from '@/types'

interface AuthUser {
  userId: string
  username: string
  email: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const TOKEN_KEY = 'beecritic_token'
const USER_KEY = 'beecritic_user'

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function persist(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token)
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: auth.userId,
      username: auth.username,
      email: auth.email,
    }),
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const applyAuth = useCallback((auth: AuthResponse) => {
    persist(auth)
    setToken(auth.token)
    setUser({
      userId: auth.userId,
      username: auth.username,
      email: auth.email,
    })
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const auth = await authApi.login({ email, password })
      applyAuth(auth)
    },
    [applyAuth],
  )

  const register = useCallback(
    async (data: {
      username: string
      email: string
      password: string
      confirmPassword: string
    }) => {
      const auth = await authApi.register(data)
      applyAuth(auth)
    },
    [applyAuth],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
