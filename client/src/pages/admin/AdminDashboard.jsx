import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStats, getAdminExhibitions, moderateExhibition } from '../../api/admin.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

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
  const { addToast } = useToast()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [pendingExhibitions, setPendingExhibitions] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [moderateTarget, setModerateTarget] = useState(null) // { ex, action }
  const [rejectReason, setRejectReason] = useState('')
  const [moderating, setModerating] = useState(false)

  const loadStats = () =>
    getAdminStats()
      .then((res) => setStats(res.data.stats))
      .finally(() => setStatsLoading(false))

  const loadPending = () =>
    getAdminExhibitions({ status: 'pending_approval', limit: 50 })
      .then((res) => setPendingExhibitions(res.data.exhibitions || []))
      .catch(() => {})
      .finally(() => setPendingLoading(false))

  useEffect(() => {
    loadStats()
    loadPending()
  }, [])

  const handleModerate = async () => {
    setModerating(true)
    try {
      await moderateExhibition(
        moderateTarget.ex._id,
        moderateTarget.action,
        moderateTarget.action === 'reject' ? rejectReason : undefined
      )
      addToast(
        moderateTarget.action === 'approve' ? 'Exhibition approved and is now live.' : 'Exhibition rejected.',
        'success'
      )
      setModerateTarget(null)
      setRejectReason('')
      loadPending()
      loadStats()
    } catch {
      addToast('Failed to update exhibition status', 'error')
    } finally {
      setModerating(false)
    }
  }

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide overview</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats?.users ?? '—'} icon="👤" to="/admin/users" />
          <StatCard label="Exhibitions" value={stats?.exhibitions ?? '—'} icon="🖼️" to="/admin/exhibitions" />
          <StatCard label="Submissions" value={stats?.submissions ?? '—'} icon="📬" to="/admin/submissions" />
          <StatCard label="Pending Photos" value={stats?.pendingPhotos ?? '—'} icon="⏳" to="/admin/moderation" />
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
        {[
          { to: '/admin/users', icon: '👤', label: 'Manage Users', desc: 'View, edit, or remove user accounts' },
          { to: '/admin/exhibitions', icon: '🖼️', label: 'Manage Exhibitions', desc: 'Browse, approve, and delete exhibitions' },
          { to: '/admin/submissions', icon: '📬', label: 'Submissions', desc: 'View all submissions grouped by exhibition' },
          { to: '/admin/moderation', icon: '🧹', label: 'Moderation', desc: 'Clean up photos pending for 15+ days' },
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

      {/* Pending exhibitions approval */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Exhibition Approvals</h2>
          {!pendingLoading && pendingExhibitions.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pendingExhibitions.length}
            </span>
          )}
        </div>

        {pendingLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : pendingExhibitions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl text-sm">
            No exhibitions waiting for approval.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Title', 'Type', 'Organizer', 'Submitted', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingExhibitions.map((ex) => (
                    <tr key={ex._id} className="hover:bg-amber-50 bg-amber-50/40">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ex.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ex.type === 'online' ? 'indigo' : 'purple'}>{ex.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{ex.createdBy?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(ex.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3 items-center">
                          <button
                            onClick={() => setModerateTarget({ ex, action: 'approve' })}
                            className="text-xs font-medium text-green-600 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setModerateTarget({ ex, action: 'reject' })}
                            className="text-xs font-medium text-orange-500 hover:underline"
                          >
                            Reject
                          </button>
                          <Link to={`/exhibitions/${ex._id}`} className="text-xs text-indigo-600 hover:underline">View</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approve / Reject modal */}
      <Modal
        isOpen={!!moderateTarget}
        onClose={() => { setModerateTarget(null); setRejectReason('') }}
        title={moderateTarget?.action === 'approve' ? 'Approve Exhibition' : 'Reject Exhibition'}
      >
        {moderateTarget?.action === 'approve' ? (
          <p className="text-gray-600 mb-6">
            Approve <strong>{moderateTarget.ex.title}</strong>? It will become live and the organizer will be notified by email.
          </p>
        ) : (
          <div className="mb-6">
            <p className="text-gray-600 mb-3">
              Reject <strong>{moderateTarget?.ex.title}</strong>? The organizer will be notified by email.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Explain why this exhibition is being rejected..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => { setModerateTarget(null); setRejectReason('') }}>Cancel</Button>
          <Button
            variant={moderateTarget?.action === 'approve' ? 'primary' : 'danger'}
            loading={moderating}
            onClick={handleModerate}
          >
            {moderateTarget?.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
