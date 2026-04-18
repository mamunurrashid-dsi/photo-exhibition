import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStalePhotos, deleteAdminStalePhoto } from '../../api/admin.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

function daysSince(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export default function AdminModerationPage() {
  const { addToast } = useToast()
  const [photos, setPhotos] = useState([])
  const [staleDays, setStaleDays] = useState(15)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    getAdminStalePhotos()
      .then((res) => {
        setPhotos(res.data.photos || [])
        if (res.data.staleDays) setStaleDays(res.data.staleDays)
      })
      .catch(() => addToast('Failed to load stale photos', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAdminStalePhoto(deleteTarget._id)
      addToast('Photo deleted and submitter notified by email', 'success')
      setDeleteTarget(null)
      setPhotos((prev) => prev.filter((p) => p._id !== deleteTarget._id))
    } catch {
      addToast('Delete failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-2">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
        {!loading && photos.length > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {photos.length} stale
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Photos that have been in <strong>pending</strong> state for more than {staleDays} days — the organizer has not reviewed them.
        Deleting a photo here will permanently remove it from the storage server and notify the submitter by email.
      </p>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
          <p className="text-lg font-medium mb-1">All clear</p>
          <p className="text-sm">No photos have been pending for more than {staleDays} days.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Photo', 'Submitter', 'Exhibition', 'Submitted', 'Days Pending', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {photos.map((photo) => {
                  const days = daysSince(photo.createdAt)
                  return (
                    <tr key={photo._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo.thumbnailUrl || photo.imageUrl}
                            alt={photo.title}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{photo.title}</p>
                            <p className="text-xs text-gray-400 capitalize">{photo.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{photo.submission?.submitterName || '—'}</p>
                        <p className="text-xs text-gray-500">{photo.submission?.submitterEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {photo.exhibition
                          ? <Link to={`/exhibitions/${photo.exhibition._id}`} className="hover:underline text-indigo-600">{photo.exhibition.title}</Link>
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(photo.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${days >= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {days}d
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteTarget(photo)}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Delete &amp; Notify
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Stale Photo">
        <p className="text-gray-600 mb-2">
          Delete <strong>{deleteTarget?.title}</strong>?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This will permanently remove the photo from the storage server and send an email to{' '}
          <strong>{deleteTarget?.submission?.submitterName}</strong> ({deleteTarget?.submission?.submitterEmail}) letting
          them know it was removed because it was pending for more than {staleDays} days.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete &amp; Notify</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
