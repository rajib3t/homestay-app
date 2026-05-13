import { env } from '@/lib/env'
export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">{env.get('APP_NAME')}</h1>
        <nav className="space-x-6 hidden md:block">
          <a className="hover:text-primary">Stays</a>
          <a className="hover:text-primary">Experiences</a>
          <a className="hover:text-primary">Host</a>
          <a className="hover:text-primary">Login</a>
        </nav>
      </div>
    </header>
  );
}
