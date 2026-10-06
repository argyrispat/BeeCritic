const IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function posterUrl(path?: string | null, size: 'w342' | 'w500' | 'w780' = 'w500') {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

export function backdropUrl(path?: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

export function profileUrl(path?: string | null, size: 'w185' | 'w342' = 'w185') {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

export function yearFromDate(date?: string | null) {
  if (!date) return null
  return date.slice(0, 4)
}

export function formatRuntime(minutes?: number | null) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMemberSince(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  })
}

export function truncate(text: string, max = 160) {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}
