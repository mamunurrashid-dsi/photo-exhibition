import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExhibitions } from '../../api/exhibitions.api'
import { useAuth } from '../../context/AuthContext'
import ExhibitionCard from '../../components/ui/ExhibitionCard'
import Spinner from '../../components/ui/Spinner'

export default function Home() {
  const { user } = useAuth()
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getExhibitions({ limit: 6, status: 'active' })
      .then((res) => setExhibitions(res.data.exhibitions || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{ backgroundImage: 'radial-gradient(#c7d2fe 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        {/* Soft glow accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-indigo-200 rounded-full opacity-30 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-200 rounded-full opacity-30 blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">

          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-200 rounded-full px-4 py-1.5 text-sm text-indigo-600 font-medium mb-6">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              Photography Exhibition Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Where Photography<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Meets the World
              </span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Create and explore photography exhibitions — online or offline, public or private.
              Showcase your work, discover talented photographers, and connect with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to={user ? '/dashboard/exhibitions/new' : '/login'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-200"
              >
                Create an Exhibition
              </Link>
              <Link
                to="/exhibitions"
                className="border border-gray-300 hover:border-indigo-400 text-gray-700 hover:text-indigo-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
              >
                Browse Exhibitions →
              </Link>
            </div>
          </div>

          {/* Right: Real photo mosaic */}
          <div className="flex-1 relative h-80 sm:h-96 lg:h-[500px] w-full hidden sm:block">
            {/* Card 1 — Nature, landscape, top-left, tilted left */}
            <div className="absolute top-0 left-0 w-56 h-40 lg:w-64 lg:h-44 rounded-2xl overflow-hidden shadow-xl -rotate-6 border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80"
                alt="Nature"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <span className="text-xs text-white/80 font-medium">Nature</span>
              </div>
            </div>

            {/* Card 2 — Wildlife, portrait, top-right, tilted right */}
            <div className="absolute top-2 right-4 w-36 h-52 lg:w-44 lg:h-60 rounded-2xl overflow-hidden shadow-xl rotate-4 border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=400&q=80"
                alt="Wildlife"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <span className="text-xs text-white/80 font-medium">Wildlife</span>
              </div>
            </div>

            {/* Card 3 — Street, landscape, center */}
            <div className="absolute top-36 left-24 lg:left-32 w-52 h-36 lg:w-60 lg:h-40 rounded-2xl overflow-hidden shadow-xl rotate-2 border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=500&q=80"
                alt="Street"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <span className="text-xs text-white/80 font-medium">Street</span>
              </div>
            </div>

            {/* Card 4 — Architecture, landscape, bottom-left */}
            <div className="absolute bottom-4 left-2 w-48 h-32 lg:w-56 lg:h-36 rounded-2xl overflow-hidden shadow-xl -rotate-3 border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=500&q=80"
                alt="Architecture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <span className="text-xs text-white/80 font-medium">Architecture</span>
              </div>
            </div>

            {/* Card 5 — Camera gear, bottom-right */}
            <div className="absolute bottom-0 right-0 w-40 h-28 lg:w-48 lg:h-32 rounded-2xl overflow-hidden shadow-xl rotate-5 border-2 border-white">
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"
                alt="Camera"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                <span className="text-xs text-white/80 font-medium">Gear</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🌐',
                title: 'Online Exhibitions',
                desc: 'Host virtual photo exhibitions. Accept submissions, curate your gallery, and share with the world — or keep it private with a unique link.',
              },
              {
                icon: '📍',
                title: 'Offline Listings',
                desc: 'List your physical photography exhibitions with venue details, dates, and themes to help local photography enthusiasts discover your event.',
              },
              {
                icon: '🔒',
                title: 'Private Exhibitions',
                desc: 'Create invite-only exhibitions for your company or community. Restrict access by email domain for corporate exhibitions.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent exhibitions */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent Exhibitions</h2>
            <Link to="/exhibitions" className="text-indigo-600 text-sm font-medium hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : exhibitions.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No exhibitions yet. Be the first!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitions.map((ex) => (
                <ExhibitionCard key={ex._id} exhibition={ex} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to showcase your photography?</h2>
          <p className="text-indigo-100 mb-8">
            Join photographers sharing their work through online and offline exhibitions.
          </p>
          <Link
            to={user ? '/dashboard/exhibitions/new' : '/register'}
            className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg inline-block"
          >
            {user ? 'Create an Exhibition' : 'Get started for free'}
          </Link>
        </div>
      </section>
    </div>
  )
}
