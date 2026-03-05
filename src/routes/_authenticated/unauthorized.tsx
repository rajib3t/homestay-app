import { createFileRoute } from '@tanstack/react-router'
import { ErrorView } from '@/components/error-pages/error-view'

export const Route = createFileRoute('/_authenticated/unauthorized')({
  component: () => (
    <ErrorView 
      statusCode="403"
      title="Unauthorized Access"
      message="You don't have permission to access this page. Please contact your administrator if you believe this is an error."
    />
  ),
})
