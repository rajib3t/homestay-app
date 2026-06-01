import { useAtomValue } from 'jotai'
import { appLogo, appName } from '@/store/setting'
export default function Header() {
  const name = useAtomValue(appName)
  const logo = useAtomValue(appLogo)
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {logo ? (
            <img
              src={logo}
              alt={name || 'App Logo'}
              className="h-20 w-20 rounded object-contain"
            />
          ) : null}
          {/* <h1 className="font-glitten text-xl  text-primary">
            {name || 'Homestay'}
          </h1> */}
        </div>
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
