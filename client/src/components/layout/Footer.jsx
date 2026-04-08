import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top part */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-8 border-b border-gray-200">
          {/* Left: Logo + tagline */}
          <div className="flex flex-col gap-2">
            <Link to="/">
              <img src="/alokchitra_logo.svg" alt="Alokchitra" className="h-20 w-auto" />
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              Create and explore photography exhibitions — online or offline, public or private.
            </p>
          </div>

          {/* Right: Nav links */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Explore</p>
            <Link to="/exhibitions" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Exhibitions
            </Link>
            <Link to="/register" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Create Exhibition
            </Link>
          </div>
        </div>

        {/* Bottom part */}
        <div className="pt-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Alokchitra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
