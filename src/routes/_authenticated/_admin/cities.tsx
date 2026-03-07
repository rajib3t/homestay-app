import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { setMetaTitle } from '@/lib/utils'
export const Route = createFileRoute('/_authenticated/_admin/cities')({
  component: RouteComponent,
})

function RouteComponent() {
     useEffect(() => {
        setMetaTitle('Cities', 'Manage Cities')
      }, [])
  return (<div>Hello "/_authenticated/_admin/cities"!</div>)
}
