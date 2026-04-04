import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getExhibition, updateExhibition } from '../../api/exhibitions.api'
import ExhibitionForm from '../../components/forms/ExhibitionForm'
import PageWrapper from '../../components/layout/PageWrapper'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../context/ToastContext'

export default function EditExhibitionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [exhibition, setExhibition] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getExhibition(id)
      .then((res) => {
        const ex = res.data.exhibition
        // Flatten venue for form defaults
        if (ex.venue) {
          ex.venueAddress = ex.venue.address || ''
          ex.venueCity = ex.venue.city || ''
          ex.venueCountry = ex.venue.country || ''
        }
        // Format dates for date inputs
        if (ex.submissionStartDate)
          ex.submissionStartDate = ex.submissionStartDate.slice(0, 10)
        if (ex.submissionEndDate)
          ex.submissionEndDate = ex.submissionEndDate.slice(0, 10)
        if (ex.exhibitionStartDate)
          ex.exhibitionStartDate = ex.exhibitionStartDate.slice(0, 10)
        if (ex.exhibitionEndDate)
          ex.exhibitionEndDate = ex.exhibitionEndDate.slice(0, 10)
        setExhibition(ex)
      })
      .catch(() => addToast('Failed to load exhibition', 'error'))
      .finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await updateExhibition(id, formData)
      addToast('Exhibition updated', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Exhibition</h1>
            <p className="text-gray-500 text-sm">{exhibition?.title}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {exhibition && (
            <ExhibitionForm defaultValues={exhibition} onSubmit={handleSubmit} loading={loading} />
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
