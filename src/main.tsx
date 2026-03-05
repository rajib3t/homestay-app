import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'
import { readAuthToken } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import { queryClient } from '@/lib/query-client'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  // Increase stale time to reduce unnecessary preloading
  defaultPreloadStaleTime: 30000, // 30 seconds
})

// Restore persisted auth token (if any) so protected API requests work after reload
try {
  const token = readAuthToken()
  if (token) {
    apiClient.setAuthToken(token)
  }
} catch (e) {
  // ignore
}

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

// Note: reportWebVitals removed to improve initial load performance
// Add it back only if you need performance monitoring
