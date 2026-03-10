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
      const loc = Array.isArray(d.loc) ? d.loc : null
      const field = loc ? loc[loc.length - 1] : '_base'
      const msg = d.msg || d.message || String(d)
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
      if (Object.keys(map).length) return map
    }
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
