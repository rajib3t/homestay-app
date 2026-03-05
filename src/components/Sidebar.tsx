import { Link } from '@tanstack/react-router'
import { Home, X } from 'lucide-react'
// React import not required with the new JSX transform

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white text-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={18} />
            <span className="font-medium">Home</span>
          </Link>

          {/* Add more nav links here — patient list, appointments, settings, etc. */}
        </nav>
      </aside>
    </>
  )
}
