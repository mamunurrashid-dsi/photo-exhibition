import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../api/admin.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatDate'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { addToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [acting, setActing] = useState(false)

  const load = () => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (search.trim()) params.search = search.trim()
    getAdminUsers(params)
      .then((res) => {
        setUsers(res.data.users || [])
        setTotalPages(res.data.totalPages || 1)
      })
      .catch(() => addToast('Failed to load users', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, search])

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      await updateAdminUser(user._id, { role: newRole })
      addToast(`User role changed to ${newRole}`, 'success')
      load()
    } catch {
      addToast('Failed to update role', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActing(true)
    try {
      await deleteAdminUser(deleteTarget._id)
      addToast('User deleted', 'success')
      setDeleteTarget(null)
      load()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error')
    } finally {
      setActing(false)
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
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name or email..."
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
                  {['Name', 'Email', 'Role', 'Provider', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === 'admin' ? 'danger' : 'default'}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{u.provider}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u._id !== currentUser._id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRoleToggle(u)}
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={acting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
