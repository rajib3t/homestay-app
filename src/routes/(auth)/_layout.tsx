import { createFileRoute, Outlet } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute('/(auth)/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <React.Fragment>
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-950 p-4">
        <Outlet />
      </div>
    </React.Fragment>
  )
}
