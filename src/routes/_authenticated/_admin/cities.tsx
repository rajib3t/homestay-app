import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_admin/cities')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_admin/cities"!</div>
}
