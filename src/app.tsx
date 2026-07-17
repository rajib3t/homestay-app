import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { readAuthToken } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import './styles.css'

export const Route = createRootRouteWithContext<{
  queryClient: typeof queryClient
}>()({
  component: () => {
    // Restore persisted auth token (if any) so protected API requests work after reload
    try {
      const token = readAuthToken()
      if (token) {
        apiClient.setAuthToken(token)
      }
    } catch (e) {
      // ignore
    }

    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    )
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
    scripts: [],
  }),
})
