import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getPhoto, ratePhoto, getMyRating, getComments, addComment } from '../../api/photos.api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Spinner from '../../components/ui/Spinner'

function Stars({ value, max = 5, size = 'md' }) {
  const filled = Math.round(value)
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg'
  return (
    <span className={sizeClass} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < filled ? 'text-amber-400' : 'text-gray-300'}>★</span>
      ))}
    </span>
  )
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-colors focus:outline-none"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <span className={(hovered || value) >= star ? 'text-amber-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  )
}

export default function PhotoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const location = useLocation()
  const loginState = { state: { from: location } }

  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [userRating, setUserRating] = useState(null)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    getPhoto(id)
      .then((res) => setPhoto(res.data.photo))
      .catch(() => addToast('Photo not found', 'error'))
      .finally(() => setLoading(false))

    getComments(id)
      .then((res) => setComments(res.data.comments))
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [id])

  useEffect(() => {
    if (!user) return
    getMyRating(id)
      .then((res) => setUserRating(res.data.userRating))
      .catch(() => {})
  }, [id, user])

  const handleRate = async (star) => {
    if (!user) { addToast('Please log in to rate photos', 'error'); return }
    if (submittingRating) return
    setSubmittingRating(true)
    try {
      const res = await ratePhoto(id, star)
      setUserRating(star)
      setPhoto((prev) => ({
        ...prev,
        avgRating: res.data.avgRating,
        ratingCount: res.data.ratingCount,
      }))
    } catch {
      addToast('Failed to submit rating', 'error')
    } finally {
      setSubmittingRating(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      const res = await addComment(id, commentText)
      setComments((prev) => [res.data.comment, ...prev])
      setCommentText('')
    } catch {
      addToast('Failed to post comment', 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!photo) {
    return (
      <PageWrapper>
        <div className="text-center py-20 text-red-600">Photo not found.</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-6"
        >
          ← Back
        </button>

        {/* Photo */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-black mb-6">
          <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full object-contain max-h-[70vh]"
          />
        </div>

        {/* Photo info + average rating stars */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{photo.title}</h1>
          <p className="text-sm text-gray-500 mb-1">{photo.submitterName}</p>
          {photo.cameraGear && (
            <p className="text-xs text-gray-400 mb-3">{photo.cameraGear}</p>
          )}
          <div className="flex items-center gap-2">
            <Stars value={photo.avgRating} size="lg" />
            {photo.ratingCount > 0 && (
              <span className="text-sm text-gray-400">({photo.ratingCount})</span>
            )}
          </div>
        </div>

        {/* Rate this photo — separate section, hidden for own photo */}
        {(() => {
          const isOwnPhoto = photo.submitterUser && photo.submitterUser === user?._id
          if (isOwnPhoto) return null
          return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                {userRating ? 'Your Rating' : 'Rate This Photo'}
              </h2>
              {user ? (
                <div className="flex items-center gap-3">
                  <StarPicker value={userRating || 0} onChange={handleRate} />
                  {userRating && (
                    <span className="text-xs text-gray-400">You rated {userRating} ★</span>
                  )}
                  {submittingRating && <Spinner size="sm" />}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  <Link to="/login" {...loginState} className="text-indigo-600 hover:underline">Log in</Link> to rate this photo.
                </p>
              )}
            </div>
          )
        })()}

        {/* Comments */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Comments {comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
          </h2>

          {/* Add comment — hidden for the photo's own submitter */}
          {photo.submitterUser && photo.submitterUser === user?._id ? null : user ? (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submittingComment ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-400 mb-6">
              <Link to="/login" {...loginState} className="text-indigo-600 hover:underline">Log in</Link> to leave a comment.
            </p>
          )}

          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No comments yet. Be the first!</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c._id} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">{c.userName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-CA')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{c.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}