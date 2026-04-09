import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createExhibition } from '../../api/exhibitions.api'
import ExhibitionForm from '../../components/forms/ExhibitionForm'
import PageWrapper from '../../components/layout/PageWrapper'
import { useToast } from '../../context/ToastContext'

export default function CreateExhibitionPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      const res = await createExhibition(formData)
      const { exhibition, pendingApproval } = res.data

      if (pendingApproval) {
        addToast('Exhibition submitted for review. You will be notified once it is approved.', 'info', 7000)
      } else {
        addToast('Exhibition created successfully!', 'success')
      }

      if (exhibition.visibility === 'private' && exhibition.privateToken) {
        const privateUrl = `${window.location.origin}/e/${exhibition.privateToken}`
        addToast(`Private link: ${privateUrl} — Share this with your guests.`, 'info', 8000)
      }

      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create exhibition', 'error')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Create Exhibition</h1>
            <p className="text-gray-500 text-sm">Set up a new online or offline photography exhibition.</p>
          </div>
        </div>

        {/* Legal disclosure */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-amber-500 text-xl leading-none mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">Content Policy & Legal Notice</p>
              <p className="text-sm text-amber-700 leading-relaxed">
                All exhibitions are reviewed before going live. Exhibitions containing <strong>nudity, vulgarity, hate speech, or any illegal content</strong> will be immediately removed by the administration.
                Repeated or serious violations may result in <strong>account suspension and legal action</strong> in accordance with applicable laws.
                By submitting, you confirm that your exhibition complies with our content policy and that you hold the rights to all material displayed.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <ExhibitionForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </PageWrapper>
  )
}
