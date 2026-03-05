import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'

export function NotFoundError() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-card border shadow-xl">
          <FileQuestion className="h-12 w-12 text-primary" />
        </div>
      </div>
      
      <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">404</h1>
      <p className="mb-8 text-xl text-muted-foreground">
        Oops! The page you're looking for doesn't exist.
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild variant="default" size="lg" className="px-8">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
        <Button variant="outline" size="lg" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
