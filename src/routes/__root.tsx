import { Outlet, createRootRouteWithContext ,   useMatches,} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import React, { useLayoutEffect } from 'react'
import { Toaster } from "@/components/ui/sonner"

// Lazy load devtools only in development
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      }))
    )

import { ErrorView } from '@/components/error-pages/error-view'
import { env } from '@/lib/env'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <React.Fragment>
      <Meta>
      <Outlet />
      {!import.meta.env.PROD && (
        <React.Suspense fallback={null}>
          <TanStackRouterDevtools position="bottom-right" />
        </React.Suspense>
      )}
      <Toaster  />
      </Meta>
    </React.Fragment>
  ),
  notFoundComponent: () => (
    <ErrorView 
      statusCode="404"
      title="Page Not Found"
      message="Oops! The page you're looking for doesn't exist. It might have been moved or deleted."
    />
  ),
})

function Meta({ children }: { children: React.ReactNode }) {
  const matches = useMatches()

  const head = React.useMemo(() => {
    // For each match, prefer `head` (function or object) then `meta`.
    const items = matches
      .map((m: any) => {
        if (m.head) return typeof m.head === 'function' ? m.head() : m.head
        if (m.meta) return m.meta
        return undefined
      })
      .filter(Boolean) as any[]

    if (items.length === 0) return undefined

    const result: any = {}

    // Iterate in order and allow later entries to override earlier ones
    items.forEach((it) => {
      // If item is an object with title/meta/canonical
      if (typeof it === 'object' && !Array.isArray(it)) {
        if (it.title) result.title = it.title
        if (it.canonical) result.canonical = it.canonical
        // If it has a `meta` array, process entries
        if (Array.isArray(it.meta)) {
          it.meta.forEach((entry: any) => {
            if (entry.name === 'description') result.description = entry.content
            else if (entry.name === 'keywords') result.keywords = entry.content
            else if (entry.property && entry.property.startsWith('og:')) {
              const key = entry.property.replace('og:', '')
              if (key === 'title') result.ogTitle = entry.content
              else if (key === 'description') result.ogDescription = entry.content
              else if (key === 'image') result.ogImage = entry.content
            } else if (entry.name && entry.name.startsWith('twitter:')) {
              // map twitter:title/description to og equivalents if not set
              if (entry.name === 'twitter:title' && !result.ogTitle) result.ogTitle = entry.content
              if (entry.name === 'twitter:description' && !result.ogDescription) result.ogDescription = entry.content
            }
          })
        }
      } else if (Array.isArray(it)) {
        // If it's an array of meta entries
        it.forEach((entry: any) => {
          if (entry.name === 'description') result.description = entry.content
          else if (entry.name === 'keywords') result.keywords = entry.content
          else if (entry.property && entry.property.startsWith('og:')) {
            const key = entry.property.replace('og:', '')
            if (key === 'title') result.ogTitle = entry.content
            else if (key === 'description') result.ogDescription = entry.content
            else if (key === 'image') result.ogImage = entry.content
          }
        })
      }
    })

    return result
  }, [matches])

  useLayoutEffect(() => {
    if (!head) return

    const appName = env.get('APP_NAME') || 'MyApp'

    // Title
    const titleSource = head.title ?? head.ogTitle ?? head.ogTitle
    if (titleSource) {
      const fullTitle = String(titleSource).includes('|') ? String(titleSource) : `${String(titleSource)} | ${appName}`
      document.title = fullTitle
      // Ensure the <title> element in head is also updated (some browsers/readers rely on it)
      let titleEl = document.head.querySelector('title')
      if (!titleEl) {
        titleEl = document.createElement('title')
        document.head.appendChild(titleEl)
      }
      // Use textContent to avoid HTML injection
      titleEl.textContent = fullTitle

      // Also set twitter:title for social previews
      const setMeta = (attr: 'name' | 'property', key: string, value?: string) => {
        if (!value) return
        let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
        if (!el) {
          el = document.createElement('meta')
          el.setAttribute(attr, key)
          document.head.appendChild(el)
        }
        el.setAttribute('content', value)
      }

      setMeta('name', 'twitter:title', fullTitle)
    }

    // Helper to set or create meta tags
    const setMeta = (attr: 'name' | 'property', key: string, value?: string) => {
      if (!value) return
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    setMeta('name', 'description', head.description)
    setMeta('name', 'keywords', head.keywords)
    setMeta('property', 'og:title', head.ogTitle ?? head.title)
    setMeta('name', 'twitter:title', head.ogTitle ?? head.title)
    setMeta('property', 'og:description', head.ogDescription ?? head.description)
    setMeta('name', 'twitter:description', head.ogDescription ?? head.description)
    if (head.ogImage) setMeta('property', 'og:image', head.ogImage)

    // Canonical link
    if (head.canonical) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', head.canonical)
    }
  }, [head])

  return children
}