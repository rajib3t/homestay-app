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
