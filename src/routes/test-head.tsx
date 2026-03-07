import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-head')({
  head: () => ({
    title: 'Test Head',
    canonical: 'https://example.com/test-head',
    meta: [
      {
        name: 'description',
        content: 'This is a test route for head/meta management.',
      },
      {
        property: 'og:title',
        content: 'Test Head',
      },
      {
        property: 'og:description',
        content: 'Open Graph description for test head route.',
      },
      {
        property: 'og:image',
        content: '/og-test.png',
      },
      {
        name: 'twitter:title',
        content: 'Test Head',
      },
      {
        name: 'twitter:description',
        content: 'Twitter description for test head route.',
      },
    ],
  }),
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Head Route</h1>
      <p className="mt-4">This route sets title and meta tags for testing.</p>
    </div>
  ),
})
