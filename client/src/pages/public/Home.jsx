import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExhibitions } from '../../api/exhibitions.api'
import ExhibitionCard from '../../components/ui/ExhibitionCard'
import Spinner from '../../components/ui/Spinner'

export default function Home() {
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
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Where Photography Meets the World
          </h1>
          <p className="text-lg sm:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Create and explore photography exhibitions — online or offline, public or private.
            Showcase your work, discover talented photographers, and connect with the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Create an Exhibition
            </Link>
            <Link
              to="/exhibitions"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Browse Exhibitions
            </Link>
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
      <section className="bg-indigo-600 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to showcase your photography?</h2>
          <p className="text-indigo-200 mb-8">
            Join thousands of photographers sharing their work through online and offline exhibitions.
          </p>
          <Link
            to="/register"
            className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors inline-block"
          >
            Get started for free
          </Link>
        </div>
      </section>
    </div>
  )
}
