import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getSubmissions,
  approveSubmission,
  unapproveSubmission,
  rejectSubmission,
  deleteSubmission,
} from '../../api/submissions.api'
import { getExhibition } from '../../api/exhibitions.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected']

export default function ManageSubmissionsPage() {
  const { id } = useParams()
  const { addToast } = useToast()
  const [exhibition, setExhibition] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionTarget, setActionTarget] = useState(null)
  const [actionType, setActionType] = useState(null) // 'reject' | 'unapprove'
  const [rejectReason, setRejectReason] = useState('')
  const [acting, setActing] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const loadData = () => {
    setLoading(true)
    const params = statusFilter !== 'all' ? { status: statusFilter } : {}
    Promise.all([getExhibition(id), getSubmissions(id, params)])
      .then(([exRes, subRes]) => {
        setExhibition(exRes.data.exhibition)
        setSubmissions(subRes.data.submissions || [])
      })
      .catch(() => addToast('Failed to load submissions', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [id, statusFilter])

  const handleApprove = async (subId) => {
    setActing(true)
    try {
      await approveSubmission(subId)
      addToast('Submission approved', 'success')
      loadData()
    } catch {
      addToast('Failed to approve', 'error')
    } finally {
      setActing(false)
    }
  }

  const handleUnapprove = async () => {
    if (!actionTarget) return
    setActing(true)
    try {
      await unapproveSubmission(actionTarget._id, rejectReason)
      addToast('Submission moved back to pending', 'success')
      setActionTarget(null)
      setRejectReason('')
      loadData()
    } catch {
      addToast('Failed to unapprove', 'error')
    } finally {
      setActing(false)
    }
  }

  const handleReject = async () => {
    if (!actionTarget) return
    setActing(true)
    try {
      await rejectSubmission(actionTarget._id, rejectReason)
      addToast('Submission rejected', 'success')
      setActionTarget(null)
      setRejectReason('')
      loadData()
    } catch {
      addToast('Failed to reject', 'error')
    } finally {
      setActing(false)
    }
  }

  const handleDelete = async (subId) => {
    setActing(true)
    try {
      await deleteSubmission(subId)
      addToast('Submission deleted', 'success')
      loadData()
    } catch {
      addToast('Failed to delete', 'error')
    } finally {
      setActing(false)
    }
  }

  const statusVariant = (s) =>
    ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s] || 'default')

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          {exhibition && <p className="text-gray-500 text-sm">{exhibition.title}</p>}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium capitalize transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">
          No submissions found.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{sub.submitterName}</p>
                    <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{sub.submitterEmail}</p>
                  {sub.instagramHandle && (
                    <p className="text-sm text-gray-400">@{sub.instagramHandle}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Submitted {formatDateShort(sub.createdAt)}
                  </p>
                  {sub.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">
                      Reason: {sub.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Photo thumbnails */}
                {sub.photos?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sub.photos.map((photo) => (
                      <button
                        key={photo._id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="relative group"
                        aria-label={`View photo: ${photo.title}`}
                      >
                        <img
                          src={photo.thumbnailUrl || photo.imageUrl}
                          alt={photo.title}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:ring-2 hover:ring-indigo-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                {sub.status === 'pending' && (
                  <>
                    <Button size="sm" variant="primary" loading={acting} onClick={() => handleApprove(sub._id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setActionTarget(sub); setActionType('reject'); setRejectReason('') }}>
                      Reject
                    </Button>
                  </>
                )}
                {sub.status === 'approved' && (
                  <Button size="sm" variant="outline" onClick={() => { setActionTarget(sub); setActionType('unapprove'); setRejectReason('') }}>
                    Unapprove
                  </Button>
                )}
                {(sub.status === 'pending' || sub.status === 'rejected') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(sub._id)}
                    loading={acting}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo lightbox modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.title || 'Photo'}
        maxWidth="max-w-2xl"
      >
        {selectedPhoto && (
          <div>
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.title}
              className="w-full rounded-lg mb-4"
            />
            <p className="text-sm text-gray-600">Category: <strong className="capitalize">{selectedPhoto.category}</strong></p>
            {selectedPhoto.cameraGear && (
              <p className="text-sm text-gray-600 mt-1">Camera: {selectedPhoto.cameraGear}</p>
            )}
          </div>
        )}
      </Modal>

      {/* Reject / Unapprove modal */}
      <Modal
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        title={actionType === 'unapprove' ? 'Unapprove Submission' : 'Reject Submission'}
      >
        <p className="text-gray-600 text-sm mb-4">
          {actionType === 'unapprove'
            ? <>You are moving the submission by <strong>{actionTarget?.submitterName}</strong> back to pending. The submitter will be notified.</>
            : <>You are rejecting the submission by <strong>{actionTarget?.submitterName}</strong>. Optionally provide feedback.</>
          }
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={actionType === 'unapprove' ? 'Note for submitter (optional)' : 'Reason for rejection (optional)'}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setActionTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            loading={acting}
            onClick={actionType === 'unapprove' ? handleUnapprove : handleReject}
          >
            {actionType === 'unapprove' ? 'Unapprove' : 'Reject'}
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
