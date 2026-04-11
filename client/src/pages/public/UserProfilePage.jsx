import { useEffect, useState } from 'react'
import { useParams, Link, Navigate, useLocation } from 'react-router-dom'
import { getPublicProfile } from '../../api/users.api'
import { useAuth } from '../../context/AuthContext'
import ExhibitionCard from '../../components/ui/ExhibitionCard'
import GalleryGrid from '../../components/exhibitions/GalleryGrid'
import PageWrapper from '../../components/layout/PageWrapper'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatDate'

function Avatar({ avatarUrl, name, size = 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-16 h-16 text-xl'
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-4 border-white shadow-md`}
      />
    )
  }
  return (
    <div className={`${sizeClass} rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center border-4 border-white shadow-md`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

export default function UserProfilePage() {
  const { id } = useParams()
  const location = useLocation()
  const { user: currentUser, loading: authLoading } = useAuth()
  const isOwnProfile = currentUser?._id === id
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicProfile(id)
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.response?.data?.message || 'User not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (authLoading) return null
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="text-center py-20 text-gray-500">{error}</div>
      </PageWrapper>
    )
  }

  const { user, photos, exhibitions } = profile

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">

        {/* Profile header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar avatarUrl={user.avatarUrl} name={user.name} />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors self-center sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Link>
              )}
            </div>
            {user.bio && (
              <p className="text-gray-600 mt-2 max-w-xl leading-relaxed">{user.bio}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">Member since {formatDate(user.createdAt)}</p>
          </div>
        </div>

        {/* Exhibitions */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Exhibitions
            {exhibitions.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400">({exhibitions.length})</span>
            )}
          </h2>
          {exhibitions.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">No public exhibitions yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitions.map((ex) => (
                <ExhibitionCard key={ex._id} exhibition={ex} />
              ))}
            </div>
          )}
        </section>

        {/* Photos */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Photos
            {photos.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-400">({photos.length})</span>
            )}
          </h2>
          {photos.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">No approved photos yet.</p>
          ) : (
            <GalleryGrid photos={photos} categories={[]} />
          )}
        </section>

      </div>
    </PageWrapper>
  )
}
