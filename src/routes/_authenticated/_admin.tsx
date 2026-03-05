import type { UserData } from '@/types/user'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_admin')({
  beforeLoad: ({ context }) => {
    const profile = context.queryClient.getQueryData(['GET_PROFILE']) as UserData

    if (!profile) {
      throw redirect({ to: '/login' })
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