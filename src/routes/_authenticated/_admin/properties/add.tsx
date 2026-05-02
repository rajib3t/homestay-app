import React from 'react'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_authenticated/_admin/properties/add')({
    head: () => ({
        title: "Add Property",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage properties. Add, edit, or remove properties from the system.",
        },
        {
            property: 'og:title',
            content: 'Add Property',
        },
        ],
    }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
     <React.Fragment>

     </React.Fragment>
  )
}
