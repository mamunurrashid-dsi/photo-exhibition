import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminSubmissions, deleteAdminSubmission } from '../../api/admin.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected']

export default function AdminModerationPage() {
  const { addToast } = useToast()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (status !== 'all') params.status = status
    getAdminSubmissions(params)
      .then((res) => {
        setSubmissions(res.data.submissions || [])
        setTotalPages(res.data.totalPages || 1)
      })
      .catch(() => addToast('Failed to load submissions', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, status])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAdminSubmission(deleteTarget._id)
      addToast('Submission deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch {
      addToast('Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const statusVariant = (s) =>
    ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s] || 'default')

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`px-3 py-1.5 text-sm rounded-full font-medium capitalize transition-colors ${
              status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">No submissions found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Submitter', 'Exhibition', 'Status', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{sub.submitterName}</p>
                      <p className="text-xs text-gray-500">{sub.submitterEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sub.exhibition?.title || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(sub.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteTarget(sub)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50">Previous</button>
              <span className="px-3 py-1.5 text-sm">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Submission">
        <p className="text-gray-600 mb-6">Delete submission by <strong>{deleteTarget?.submitterName}</strong>? This removes the photos from Cloudinary too.</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
