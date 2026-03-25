import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/_admin/vendors/$vendorID/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/_admin/vendors/$vendorID/edit"!</div>
}
