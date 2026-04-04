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
            {visibility && <Badge variant="default">{visibility}</Badge>}
            {submissionOpen && <Badge variant="success">Submissions Open</Badge>}
            <Badge variant={status === 'active' ? 'success' : 'default'}>{status}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 text-lg mb-4">By {organizerName}</p>

          {description && (
            <p className="text-gray-600 max-w-3xl mb-6 leading-relaxed">{description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            {type === 'online' ? (
              <div>
                <span className="font-medium text-gray-700">Submission period: </span>
                {formatDate(submissionStartDate)} – {formatDate(submissionEndDate)}
              </div>
            ) : (
              <>
                <div>
                  <span className="font-medium text-gray-700">Dates: </span>
                  {formatDate(exhibitionStartDate)} – {formatDate(exhibitionEndDate)}
                </div>
                {venue && (
                  <div>
                    <span className="font-medium text-gray-700">Venue: </span>
                    {[venue.address, venue.city, venue.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </>
            )}
          </div>

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
          {submissionOpen && (
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
        )}
      </PageWrapper>
    </div>
  )
}
