// Small auth helper utilities used by login flow
import { apiClient } from '@/lib/api'

export const AUTH_STORAGE_KEY = 'access_token'

export function saveAuthToken(token: string | null | undefined) {
  if (!token) return
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, token)
    // also set on api client so subsequent requests include it
    apiClient.setAuthToken(token)
  } catch (e) {
    // Ignore storage errors (e.g., unavailable in some environments)
    console.warn('Failed to persist auth token', e)
  }
}

// Compute a safe redirect target from a full href.
// Ensures we only redirect to same-origin paths.
export function getRedirectTarget(fromHref: string): string {
  const redirectParam = new URL(fromHref).searchParams.get('redirect')
  let target = '/'
  if (!redirectParam) return target

  try {
    const parsed = new URL(redirectParam, fromHref)
    if (parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/'
    }
    // external origin -> don't use it
    return '/'
  } catch (e) {
    // treat as relative path
    return redirectParam || '/'
  }
}

export function readAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch (e) {
    return null
  }
}
