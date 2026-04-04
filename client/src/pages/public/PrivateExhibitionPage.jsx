import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPrivateExhibition, getExhibitionGallery } from '../../api/exhibitions.api'
import PrivateExhibitionGate from '../../components/exhibitions/PrivateExhibitionGate'
import GalleryGrid from '../../components/exhibitions/GalleryGrid'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import PageWrapper from '../../components/layout/PageWrapper'
import { formatDate, isSubmissionOpen } from '../../utils/formatDate'
import { Link } from 'react-router-dom'

export default function PrivateExhibitionPage() {
  const { token } = useParams()
  const [exhibition, setExhibition] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accessGranted, setAccessGranted] = useState(false)

  useEffect(() => {
    getPrivateExhibition(token)
      .then((res) => {
        const ex = res.data.exhibition
        setExhibition(ex)
        // If no email domain restriction, grant access immediately
        if (!ex.allowedEmailDomain) {
          setAccessGranted(true)
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Exhibition not found.'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (accessGranted && exhibition) {
      getExhibitionGallery(exhibition._id)
        .then((res) => setPhotos(res.data.photos || []))
        .catch(() => {})
    }
  }, [accessGranted, exhibition])

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

  if (!accessGranted && exhibition.allowedEmailDomain) {
    return (
      <PrivateExhibitionGate
        token={token}
        allowedEmailDomain={exhibition.allowedEmailDomain}
        onAccessGranted={() => setAccessGranted(true)}
      />
    )
  }

  const {
    _id,
    title,
    organizerName,
    categories = [],
    submissionStartDate,
    submissionEndDate,
    coverImageUrl,
    status,
    description,
  } = exhibition

  const submissionOpen = isSubmissionOpen(submissionStartDate, submissionEndDate)

  return (
    <div>
      {coverImageUrl && (
        <div className="w-full h-64 sm:h-80 overflow-hidden bg-gray-900">
          <img src={coverImageUrl} alt={title} className="w-full h-full object-cover opacity-80" />
        </div>
      )}
      <PageWrapper>
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="indigo">online</Badge>
            <Badge variant="default">private</Badge>
            {submissionOpen && <Badge variant="success">Submissions Open</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 text-lg mb-4">By {organizerName}</p>
          {description && <p className="text-gray-600 mb-4">{description}</p>}
          <p className="text-sm text-gray-500">
            Submission period: {formatDate(submissionStartDate)} – {formatDate(submissionEndDate)}
          </p>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((cat) => (
                <Badge key={cat} variant="default" className="capitalize">{cat}</Badge>
              ))}
            </div>
          )}
          {submissionOpen && (
            <div className="mt-6">
              <Link
                to={`/exhibitions/${_id}/submit`}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Submit Your Photos
              </Link>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
        <GalleryGrid photos={photos} categories={categories} />
      </PageWrapper>
    </div>
  )
}
