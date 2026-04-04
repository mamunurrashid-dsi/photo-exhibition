import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminExhibitions, deleteAdminExhibition } from '../../api/admin.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

export default function AdminExhibitionsPage() {
  const { addToast } = useToast()
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (search.trim()) params.search = search.trim()
    getAdminExhibitions(params)
      .then((res) => {
        setExhibitions(res.data.exhibitions || [])
        setTotalPages(res.data.totalPages || 1)
      })
      .catch(() => addToast('Failed to load exhibitions', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, search])

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

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">All Exhibitions</h1>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search exhibitions..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Title', 'Type', 'Organizer', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exhibitions.map((ex) => (
                  <tr key={ex._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">{ex.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ex.type === 'online' ? 'indigo' : 'purple'}>{ex.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ex.createdBy?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ex.status === 'active' ? 'success' : 'default'}>{ex.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(ex.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
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
