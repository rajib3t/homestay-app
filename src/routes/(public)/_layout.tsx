import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { Outlet } from '@tanstack/react-router'
import  Header  from '../-component/public/header'
import  Footer from '../-component/public/footer'
export const Route = createFileRoute('/(public)/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <React.Fragment>
        <Header />
        <Outlet />
        <Footer />
    </React.Fragment>
  )
}
