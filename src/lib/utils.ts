import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Set the document title and update common meta title tags (OG / Twitter).
 * Safe to call during client-side rendering only — no-op on server.
 */
export function setMetaTitle(title: string, description?: string) {
  if (typeof document === 'undefined' || !document.head) return

  document.title = title

  const setMeta = (
    attrName: 'name' | 'property',
    attrValue: string,
    content: string,
  ) => {
    const selector = `meta[${attrName}="${attrValue}"]`
    let el = document.head.querySelector(selector) as HTMLMetaElement | null
    if (el) {
      el.setAttribute('content', content)
    } else {
      el = document.createElement('meta')
      el.setAttribute(attrName, attrValue)
      el.setAttribute('content', content)
      document.head.appendChild(el)
    }
  }

  // Open Graph title
  setMeta('property', 'og:title', title)
  // Twitter title
  setMeta('name', 'twitter:title', title)
  // HTML description (optional)
  if (description) {
    setMeta('name', 'description', description)
    setMeta('property', 'og:description', description)
    setMeta('name', 'twitter:description', description)
  }
}

/**
 * Extract a user-friendly error message from various API/error shapes.
 */
export function getErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred.'

  // If our API client throws an ApiError with message
  if (typeof err.message === 'string' && err.message.trim()) return err.message

  // axios style: err.response.data
  const resp = err.response ?? err
  const data = resp?.data ?? resp

  // Backend wrapper style: { success: false, error: { message: '...' } }
  if (data?.error?.message) return String(data.error.message)

  // Backend wrapper style: { success: false, message: '...' }
  if (data?.message) return String(data.message)

  // Sometimes API returns error as string
  if (typeof data === 'string' && data.trim()) return data

  // Fallback to generic
  return 'An unexpected error occurred.'
}

/**
 * Parse validation error details coming from various API shapes into a
 * Record<field, string[]>. Always returns an object (may be empty).
 */
export function parseValidationErrors(err: any): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  if (!err) return map

  // 1) Standard validation array shape: [{ loc: [...], msg: '...' }, ...]
  const details = err?.details ?? err?.errors ?? err?.response?.data?.details ?? null
  if (Array.isArray(details)) {
    details.forEach((d: any) => {
      // Support multiple shapes:
      // - { loc: [...], msg: '...' } (fastapi/pydantic)
      // - { field: 'code', message: '...' } (custom backend)
      // - { msg: '...', message: '...' }
      const fieldFromLoc = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : null
      const field = d.field ?? fieldFromLoc ?? d.name ?? '_base'
      const msg = d.msg || d.message || d.msgs || String(d)
      if (!map[field]) map[field] = []
      map[field].push(msg)
    })
    return map
  }

  // 2) API may return an object mapping fields to messages: { name: ['...'] }
  const respData = err?.response?.data ?? err?.response ?? err
  if (respData && typeof respData === 'object') {
    // If it's already in the desired format, copy it
    const candidate = respData?.errors ?? respData?.validation ?? respData
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      Object.keys(candidate).forEach((k) => {
        const val = candidate[k]
        if (Array.isArray(val)) map[k] = val.map(String)
        else if (typeof val === 'string') map[k] = [val]
      })
      // If the API returned only generic keys (like message/error_code/status),
      // try to infer a field so UI can show per-field errors.
      const keys = Object.keys(map)
      const onlyGenericKeys = keys.length > 0 && keys.every(k => ['message', 'status', 'error_code'].includes(k))

      if (onlyGenericKeys) {
        const topMessage = (candidate.message ?? candidate.msg ?? map.message?.[0] ?? '').toString()
        const topErrorCode = (candidate.error_code ?? candidate.code ?? '').toString()

        // First try to derive field from structured `error_code` like COUNTRY_CODE_EXISTS
        const codeMatch = topErrorCode.match(/([A-Z_]+?)_EXISTS$/i)
        if (codeMatch) {
          const token = codeMatch[1].toLowerCase() // e.g. COUNTRY_CODE -> country_code or CODE -> code
          // strip common prefixes like country_ to get the field token
          const stripped = token.replace(/^(country_|location_|city_)/, '')
          const candidateField = stripped
          if (candidateField) return { [candidateField]: [topMessage || topErrorCode || 'Validation error'] }
        }

        // Infer field by scanning message/error_code for known field tokens
        const knownFields = ['name', 'code', 'dial_code', 'country', 'city', 'image', 'is_popular']
        const haystack = (topErrorCode + ' ' + topMessage).toLowerCase()
        for (const f of knownFields) {
          if (haystack.includes(f.toLowerCase())) return { [f]: [topMessage || topErrorCode || 'Validation error'] }
        }

        // If message mentions "already exists" without a field, prefer 'name' for duplicates
        if (/already exist(s)?/i.test(topMessage) || /already exist(s)?/i.test(topErrorCode)) {
          return { name: [topMessage || 'Already exists'] }
        }

        // If message mentions max length, try to attach to 'code' if it references characters
        if (/String should have at most .* characters/i.test(topMessage) || /at most \d+ characters/i.test(topMessage)) {
          return { code: [topMessage] }
        }

        if (topMessage) return { _base: [topMessage] }
      }

      if (Object.keys(map).length) return map
    }
  }

  // Development-only debug: if we couldn't map any fields, log the raw error
  try {
    // Vite exposes import.meta.env.DEV; guard for non-Vite environments
    const isDev = typeof import.meta !== 'undefined' ? (import.meta as any)?.env?.DEV : false
    if (isDev && typeof window !== 'undefined' && Object.keys(map).length === 0) {
      // eslint-disable-next-line no-console
      console.debug('parseValidationErrors: unable to map error shape', err)
    }
  } catch (e) {
    // ignore
  }

  // 3) Fallback: single message (string) -> assign to _base or try to infer field
  const message = getErrorMessage(err)
  // Clean prefixes like "400: "
  const cleaned = message.replace(/^(\d+:\s*)+/g, '').trim()
  if (!cleaned) return map

  // If message mentions name or country duplicate, attach to name field
  if (/country.*name.*already exists/i.test(cleaned) || /country.*already exist(s)?/i.test(cleaned) || /already exist(s)?/i.test(cleaned)) {
    map.name = [cleaned]
  } else {
    map._base = [cleaned]
  }

  return map
}
