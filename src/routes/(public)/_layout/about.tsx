import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/_layout/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(public)/_layout/about"!</div>
}
