import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PhotoExhibition. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link to="/exhibitions" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Exhibitions
            </Link>
            <Link to="/register" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Create Exhibition
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
