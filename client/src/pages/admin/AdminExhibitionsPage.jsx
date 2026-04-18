import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminExhibitions, deleteAdminExhibition, moderateExhibition } from '../../api/admin.api'
import { toggleExhibitionStatus } from '../../api/exhibitions.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

const STATUS_BADGE = {
  active: 'success',
  pending_approval: 'warning',
  rejected: 'danger',
  closed: 'default',
  archived: 'default',
  draft: 'default',
}

export default function AdminExhibitionsPage() {
  const { addToast } = useToast()
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [moderateTarget, setModerateTarget] = useState(null) // { ex, action }
  const [rejectReason, setRejectReason] = useState('')
  const [moderating, setModerating] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const load = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (search.trim()) params.search = search.trim()
    if (statusFilter) params.status = statusFilter
    getAdminExhibitions(params)
      .then((res) => {
        setExhibitions(res.data.exhibitions || [])
        setTotalPages(res.data.totalPages || 1)
      })
      .catch(() => addToast('Failed to load exhibitions', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, search, statusFilter])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAdminExhibition(deleteTarget._id)
      addToast('Exhibition deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch {
      addToast('Failed to delete', 'error')
    } finally {
      setDeleting(false)
    }
  }

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
      load()
    } catch {
      addToast('Failed to update exhibition status', 'error')
    } finally {
      setModerating(false)
    }
  }

  const handleToggleStatus = async (ex) => {
    setTogglingId(ex._id)
    try {
      await toggleExhibitionStatus(ex._id)
      addToast(ex.status === 'active' ? 'Exhibition closed.' : 'Exhibition reopened.', 'success')
      load()
    } catch {
      addToast('Failed to update exhibition status', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const pendingCount = exhibitions.filter((e) => e.status === 'pending_approval').length

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">All Exhibitions</h1>
        {pendingCount > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {pendingCount} pending approval
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search exhibitions..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All statuses</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Type', 'Organizer', 'Status', 'Submissions', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exhibitions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No exhibitions found.</td>
                  </tr>
                ) : exhibitions.map((ex) => (
                  <tr key={ex._id} className={`hover:bg-gray-50 ${ex.status === 'pending_approval' ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{ex.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ex.type === 'online' ? 'indigo' : 'purple'}>{ex.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ex.createdBy?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[ex.status] || 'default'}>
                        {ex.status === 'pending_approval' ? 'Pending' : ex.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {ex.type === 'online' ? (() => {
                        const now = new Date()
                        const start = ex.submissionStartDate ? new Date(ex.submissionStartDate) : null
                        const end = ex.submissionEndDate ? new Date(ex.submissionEndDate) : null
                        const accepting = ex.status === 'active' && (!start || start <= now) && (!end || end >= now)
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accepting ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {accepting ? 'Open' : 'Closed'}
                          </span>
                        )
                      })() : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(ex.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center flex-wrap">
                        {ex.status === 'pending_approval' && (
                          <>
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
                          </>
                        )}
                        {(ex.status === 'active' || ex.status === 'closed') && (
                          <button
                            onClick={() => handleToggleStatus(ex)}
                            disabled={togglingId === ex._id}
                            className={`text-xs font-medium hover:underline disabled:opacity-50 ${ex.status === 'active' ? 'text-amber-600' : 'text-green-600'}`}
                          >
                            {togglingId === ex._id ? '...' : ex.status === 'active' ? 'Close' : 'Reopen'}
                          </button>
                        )}
                        <Link to={`/exhibitions/${ex._id}`} className="text-xs text-indigo-600 hover:underline">View</Link>
                        <button onClick={() => setDeleteTarget(ex)} className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Previous</button>
              <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Approve / Reject modal */}
      <Modal
        isOpen={!!moderateTarget}
        onClose={() => { setModerateTarget(null); setRejectReason('') }}
        title={moderateTarget?.action === 'approve' ? 'Approve Exhibition' : 'Reject Exhibition'}
      >
        {moderateTarget?.action === 'approve' ? (
          <p className="text-gray-600 mb-6">
            Approve <strong>{moderateTarget.ex.title}</strong>? It will become live and visible to the public. The organizer will be notified by email.
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

      {/* Delete modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Exhibition">
        <p className="text-gray-600 mb-6">
          Delete <strong>{deleteTarget?.title}</strong>? This will also remove all submissions and photos.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}