// Share-link helpers: encode the cocktail mix into a compact, URL-safe token
// so a generated track can be reproduced by anyone who opens the link.

export type ShareableMix = {
  base_spirit: string
  ingredients: string[]
  mood: string
  mood_intensity: number
  ice_level: string
  shake_level: string
}

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromUrlSafe(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  return b64 + pad
}

export function encodeMix(mix: ShareableMix): string {
  const json = JSON.stringify(mix)
  if (typeof window === 'undefined') {
    return toUrlSafe(Buffer.from(json, 'utf-8').toString('base64'))
  }
  return toUrlSafe(btoa(unescape(encodeURIComponent(json))))
}

export function decodeMix(token: string | null | undefined): ShareableMix | null {
  if (!token) return null
  try {
    const b64 = fromUrlSafe(token)
    const json =
      typeof window === 'undefined'
        ? Buffer.from(b64, 'base64').toString('utf-8')
        : decodeURIComponent(escape(atob(b64)))
    const parsed = JSON.parse(json)
    if (
      typeof parsed?.base_spirit === 'string' &&
      Array.isArray(parsed?.ingredients) &&
      typeof parsed?.mood === 'string' &&
      typeof parsed?.mood_intensity === 'number' &&
      typeof parsed?.ice_level === 'string' &&
      typeof parsed?.shake_level === 'string'
    ) {
      return parsed as ShareableMix
    }
    return null
  } catch {
    return null
  }
}

export function buildShareUrl(mix: ShareableMix, origin?: string): string {
  const base =
    origin || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/jazz-bar?mix=${encodeMix(mix)}`
}
