import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  head: () => ({
    title: 'Dashboard',
    meta: [
      {
        name: 'description',
        content: 'Welcome to your dashboard. Here you can manage your account and view your activity.',
      },
      {
        property: 'og:title',
        content: 'Dashboard',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/dashboard"!</div>
}
