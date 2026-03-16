import { isAuthenticated } from '@/services/auth';
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { Header } from './-component/header';
import { AppSidebar } from './-component/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

import { fetchUserProfile } from '@/services/profile';
import { queryClient } from '@/lib/query-client';
import { GET_PROFILE_KEY } from '@/hooks/use-profile';

import { ErrorView } from '@/components/error-pages/error-view';

export const Route = createFileRoute('/_authenticated')({
     beforeLoad: async ({ location }) => {
      
        const auth = await isAuthenticated();
       
        
        if (!auth) {
          throw redirect({
            to: '/login',
            search: {
              // Use the current location to power a redirect after login
              // (Do not use `router.state.resolvedLocation` as it can
              // potentially lag behind the actual current location)
              redirect: location.href,
            },
        })
      }
        
    },
    loader: async () => {
    await queryClient.ensureQueryData({
      queryKey: GET_PROFILE_KEY,
      queryFn: async () => {
        const resp = await fetchUserProfile()
        return resp.data
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    })
  },
  component: RouteComponent,
  errorComponent: () => (
    <RouteComponent>
      <ErrorView 
        statusCode="500"
        title="Server Error"
        message="Something went wrong on our end. Please try again later or contact support if the problem persists."
      />
    </RouteComponent>
  ),
  notFoundComponent: () => (
    <RouteComponent>
      <ErrorView 
        statusCode="404"
        title="Not Found"
        message="The page you're looking for within the dashboard doesn't exist."
      />
    </RouteComponent>
  ),
})

function RouteComponent({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children || <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  )
}
