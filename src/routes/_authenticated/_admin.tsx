import type { UserData } from '@/types/user'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { fetchUserProfile } from '@/services/profile'
import { GET_PROFILE_KEY } from '@/hooks/use-profile'

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: async ({ context }) => {
    // Try to read cached profile first; if missing (e.g. full page reload),
    // fetch it via the queryClient so the admin layout doesn't incorrectly
    // redirect to `/login` when a valid session exists.
    let profile = context.queryClient.getQueryData(GET_PROFILE_KEY) as UserData | undefined
    if (!profile) {
      try {
        // fetchQuery will populate the cache
       profile = await context.queryClient.fetchQuery({
            queryKey: GET_PROFILE_KEY,
            queryFn: async () => {
              const resp = await fetchUserProfile()
              return resp.data
            },
          }) as UserData
      } catch (e) {
        // If fetching the profile fails (not authenticated), redirect to login
        throw redirect({ to: '/login' })
      }
    }

    if (profile.user_type !== 'admin') {
      throw redirect({ to: '/unauthorized' })
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}