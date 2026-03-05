import { Outlet, createRootRouteWithContext ,   useMatches,} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import React from 'react'
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
   const meta = matches.at(-1)?.meta?.find((meta: any) => meta?.title)

   React.useEffect(() => {
      // Only set title if meta title exists and document.title doesn't already contain custom title
      if (meta?.title && !document.title.includes('|')) {
         document.title = meta.title
      }
   }, [meta])

   return children
}