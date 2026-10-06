export const COOKIE_CONSENT_KEY = 'beecritic_cookie_consent'

export type CookiePreferences = {
  /** Always required for auth tokens and consent storage. */
  necessary: true
  /** Not implemented in this demo. Kept for a future optional category. */
  analytics: boolean
  /** Not implemented in this demo. Kept for a future optional category. */
  marketing: boolean
  acknowledgedAt: string | null
}

export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  acknowledgedAt: null,
}

export function readCookiePreferences(): CookiePreferences {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return { ...DEFAULT_PREFERENCES }

    const parsed = JSON.parse(raw) as Partial<CookiePreferences>
    return {
      necessary: true,
      // Optional categories stay off unless a real implementation exists later.
      analytics: false,
      marketing: false,
      acknowledgedAt:
        typeof parsed.acknowledgedAt === 'string' ? parsed.acknowledgedAt : null,
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function writeCookiePreferences(
  preferences: Omit<CookiePreferences, 'necessary' | 'acknowledgedAt'> & {
    acknowledgedAt?: string | null
  },
): CookiePreferences {
  const next: CookiePreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    acknowledgedAt: preferences.acknowledgedAt ?? new Date().toISOString(),
  }
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(next))
  return next
}

export function acknowledgeNecessaryCookies(): CookiePreferences {
  return writeCookiePreferences({
    analytics: false,
    marketing: false,
  })
}
