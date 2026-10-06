import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  acknowledgeNecessaryCookies,
  DEFAULT_PREFERENCES,
  readCookiePreferences,
  writeCookiePreferences,
  type CookiePreferences,
} from '@/lib/cookieConsent'

type CookieConsentContextValue = {
  preferences: CookiePreferences
  hasAcknowledged: boolean
  acknowledge: () => void
  savePreferences: (prefs: { analytics: boolean; marketing: boolean }) => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES
    return readCookiePreferences()
  })

  const acknowledge = useCallback(() => {
    setPreferences(acknowledgeNecessaryCookies())
  }, [])

  const savePreferences = useCallback(
    (prefs: { analytics: boolean; marketing: boolean }) => {
      // Analytics/marketing are not implemented; persist acknowledgment only.
      void prefs
      setPreferences(
        writeCookiePreferences({
          analytics: false,
          marketing: false,
        }),
      )
    },
    [],
  )

  const value = useMemo(
    () => ({
      preferences,
      hasAcknowledged: preferences.acknowledgedAt != null,
      acknowledge,
      savePreferences,
    }),
    [preferences, acknowledge, savePreferences],
  )

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return ctx
}
