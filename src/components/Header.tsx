import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="p-4 flex items-center bg-gray-800 text-white shadow-lg">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/">
            <img
              src="/tanstack-word-logo-white.svg"
              alt="App Logo"
              className="h-10"
            />
          </Link>
        </h1>

        <div className="ml-auto flex items-center gap-3">
          {/* Placeholder for right-side actions (profile, notifications) */}
        </div>
      </header>

      <Sidebar open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
