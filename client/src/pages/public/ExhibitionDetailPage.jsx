import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getExhibition, getExhibitionGallery } from '../../api/exhibitions.api'
import GalleryGrid from '../../components/exhibitions/GalleryGrid'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import PageWrapper from '../../components/layout/PageWrapper'
import { formatDate, isSubmissionOpen } from '../../utils/formatDate'

export default function ExhibitionDetailPage() {
  const { id } = useParams()
  const [exhibition, setExhibition] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getExhibition(id), getExhibitionGallery(id)])
      .then(([exRes, galleryRes]) => {
        setExhibition(exRes.data.exhibition)
        setPhotos(galleryRes.data.photos || [])
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load exhibition.'))
      .finally(() => setLoading(false))
  }, [id])

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
        <div className="text-center py-20">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link to="/exhibitions" className="text-indigo-600 hover:underline">
            Back to exhibitions
          </Link>
        </div>
      </PageWrapper>
    )
  }

  if (!exhibition) return null

  const {
    title,
    type,
    visibility,
    organizerName,
    categories = [],
    submissionStartDate,
    submissionEndDate,
    exhibitionStartDate,
    exhibitionEndDate,
    coverImageUrl,
    status,
    description,
    venue,
  } = exhibition

  const submissionOpen = type === 'online' && isSubmissionOpen(submissionStartDate, submissionEndDate)

  return (
    <div>
      {/* Cover */}
      {coverImageUrl && (
        <div className="w-full h-64 sm:h-80 lg:h-96 overflow-hidden bg-gray-900">
          <img src={coverImageUrl} alt={title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}

      <PageWrapper>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={type === 'online' ? 'indigo' : 'purple'}>{type}</Badge>
            {type === 'online' && visibility && <Badge variant="default">{visibility}</Badge>}
            {submissionOpen && <Badge variant="success">Submissions Open</Badge>}
            <Badge variant={status === 'active' ? 'success' : status === 'closed' ? 'danger' : 'default'}>
              {status === 'closed' ? 'Closed' : status}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 text-lg mb-4">
            By{' '}
            {exhibition.createdBy?._id ? (
              <Link to={`/users/${exhibition.createdBy._id}`} className="hover:text-indigo-600 transition-colors">
                {organizerName}
              </Link>
            ) : organizerName}
          </p>

          {description && (
            <p className="text-gray-600 max-w-3xl mb-6 leading-relaxed">{description}</p>
          )}

          {/* Meta */}
          {type === 'online' ? (
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Submission period: </span>
              {formatDate(submissionStartDate)} – {formatDate(submissionEndDate)}
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(exhibitionStartDate)} – {formatDate(exhibitionEndDate)}</span>
              </div>
              {venue && [venue.address, venue.city, venue.country].filter(Boolean).length > 0 && (
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{[venue.address, venue.city, venue.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {venue?.mapLink && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <a
                    href={venue.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((cat) => (
                <Badge key={cat} variant="default" className="capitalize">
                  {cat}
                </Badge>
              ))}
            </div>
          )}

          {/* Submit CTA */}
          {submissionOpen && status !== 'closed' && (
            <div className="mt-6">
              <Link
                to={`/exhibitions/${id}/submit`}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Submit Your Photos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Gallery */}
        {type === 'online' && (
          status === 'closed' ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-lg font-semibold text-gray-700 mb-1">This exhibition is closed</p>
              <p className="text-sm text-gray-500">The organizer has closed this exhibition. Photos are not available to view at this time.</p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Gallery
                {photos.length > 0 && (
                  <span className="ml-2 text-lg font-normal text-gray-500">({photos.length} photos)</span>
                )}
              </h2>
              {photos.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg">No approved photos yet.</p>
                  {submissionOpen && (
                    <p className="text-sm mt-1">Be the first to submit your work!</p>
                  )}
                </div>
              ) : (
                <GalleryGrid photos={photos} categories={categories} />
              )}
            </div>
          )
        )}
      </PageWrapper>
    </div>
  )
}
