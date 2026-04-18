import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyExhibitions, deleteExhibition, toggleExhibitionStatus } from '../../api/exhibitions.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

export default function OrganizerDashboard() {
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const { addToast } = useToast()

  const load = () => {
    setLoading(true)
    getMyExhibitions()
      .then((res) => setExhibitions(res.data.exhibitions || []))
      .catch(() => addToast('Failed to load exhibitions', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteExhibition(deleteTarget._id)
      addToast('Exhibition deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch {
      addToast('Failed to delete exhibition', 'error')
    } finally {
      setDeleting(false)
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

  const typeVariant = (type) => (type === 'online' ? 'indigo' : 'purple')
  const statusVariant = (s) =>
    ({ active: 'success', closed: 'default', draft: 'warning', archived: 'default', pending_approval: 'warning', rejected: 'danger' }[s] || 'default')

  const statusLabel = (s) =>
    ({ pending_approval: 'Pending Approval' }[s] || s)

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Exhibitions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your online and offline exhibitions.</p>
        </div>
        <Link
          to="/dashboard/exhibitions/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors self-start sm:self-auto"
        >
          + New Exhibition
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : exhibitions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4">📷</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No exhibitions yet</h2>
          <p className="text-gray-500 text-sm mb-6">Create your first exhibition to get started.</p>
          <Link
            to="/dashboard/exhibitions/new"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Exhibition
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Exhibition', 'Type', 'Status', 'Submissions', 'Dates', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {exhibitions.map((ex) => (
                  <tr key={ex._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm truncate max-w-xs">
                        {ex.title}
                      </p>
                      {ex.visibility === 'private' && (
                        <span className="text-xs text-gray-400">Private</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={typeVariant(ex.type)}>{ex.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(ex.status)}>{statusLabel(ex.status)}</Badge>
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
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {ex.type === 'online'
                        ? `${formatDateShort(ex.submissionStartDate)} – ${formatDateShort(ex.submissionEndDate)}`
                        : `${formatDateShort(ex.exhibitionStartDate)} – ${formatDateShort(ex.exhibitionEndDate)}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/exhibitions/${ex._id}`}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                        {ex.type === 'online' && (
                          <Link
                            to={`/dashboard/exhibitions/${ex._id}/submissions`}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Submissions
                          </Link>
                        )}
                        <Link
                          to={`/dashboard/exhibitions/${ex._id}/edit`}
                          className="text-xs text-gray-600 hover:underline"
                        >
                          Edit
                        </Link>
                        {(ex.status === 'active' || ex.status === 'closed') && (
                          <button
                            onClick={() => handleToggleStatus(ex)}
                            disabled={togglingId === ex._id}
                            className={`text-xs hover:underline disabled:opacity-50 ${ex.status === 'active' ? 'text-amber-600' : 'text-green-600'}`}
                          >
                            {togglingId === ex._id ? '...' : ex.status === 'active' ? 'Close' : 'Reopen'}
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(ex)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Exhibition"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This will also
          delete all submissions and photos. This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
