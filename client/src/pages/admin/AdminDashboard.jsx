import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStats } from '../../api/admin.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Spinner from '../../components/ui/Spinner'

function StatCard({ label, value, icon, to }) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data.stats))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats?.users ?? '—'} icon="👤" to="/admin/users" />
          <StatCard label="Exhibitions" value={stats?.exhibitions ?? '—'} icon="🖼️" to="/admin/exhibitions" />
          <StatCard label="Submissions" value={stats?.submissions ?? '—'} icon="📬" to="/admin/moderation" />
          <StatCard label="Approved Photos" value={stats?.approvedPhotos ?? '—'} icon="✅" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/users', icon: '👤', label: 'Manage Users', desc: 'View, edit, or remove user accounts' },
          { to: '/admin/exhibitions', icon: '🖼️', label: 'Manage Exhibitions', desc: 'Browse and delete any exhibition' },
          { to: '/admin/moderation', icon: '📋', label: 'Moderation', desc: 'Review submissions across all exhibitions' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </Link>
        ))}
      </div>
    </PageWrapper>
  )
}
