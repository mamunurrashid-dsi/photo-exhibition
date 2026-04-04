import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getExhibition } from '../../api/exhibitions.api'
import { submitPhotos, checkDuplicate } from '../../api/submissions.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../context/ToastContext'
import { isSubmissionOpen } from '../../utils/formatDate'

const schema = z.object({
  submitterName: z.string().min(2, 'Full name is required'),
  submitterEmail: z.string().email('Valid email is required'),
  instagramHandle: z.string().optional(),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms and conditions' }) }),
})

export default function SubmissionFormPage() {
  const { id } = useParams()
  const { addToast } = useToast()
  const [exhibition, setExhibition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  // Per-category photo state
  const [photoData, setPhotoData] = useState({})
  const [partialCategories, setPartialCategories] = useState([])
  const fileRefs = useRef({})

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    getExhibition(id)
      .then((res) => setExhibition(res.data.exhibition))
      .catch(() => addToast('Exhibition not found', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  const handleEmailBlur = async (e) => {
    const email = e.target.value.trim()
    if (!email || !exhibition) return
    try {
      const res = await checkDuplicate(id, email)
      setAlreadySubmitted(res.data.hasSubmitted)
    } catch {
      // silently ignore — server will enforce on submit
    }
  }

  const updatePhotoField = (category, field, value) => {
    setPhotoData((prev) => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [field]: value },
    }))
  }

  const onSubmit = async (data) => {
    if (!exhibition) return

    const categories = exhibition.categories || []
    const titles = []
    const cats = []
    const gears = []
    const files = []
    const partial = []

    for (const cat of categories) {
      const entry = photoData[cat] || {}
      const fileInput = fileRefs.current[cat]
      const hasFile = !!(fileInput?.files[0])
      const hasTitle = !!(entry.title?.trim())
      const hasGear = !!(entry.gear?.trim())
      const hasAny = hasFile || hasTitle || hasGear

      if (!hasAny) continue

      if (!hasTitle || !hasFile) {
        partial.push(cat)
        continue
      }

      titles.push(entry.title.trim())
      cats.push(cat)
      gears.push(entry.gear || '')
      files.push(fileInput.files[0])
    }

    if (partial.length > 0) {
      setPartialCategories(partial)
      return
    }

    setPartialCategories([])

    if (cats.length === 0) {
      addToast('Please upload at least one photo.', 'error')
      return
    }

    const formData = new FormData()
    formData.append('exhibitionId', id)
    formData.append('submitterName', data.submitterName)
    formData.append('submitterEmail', data.submitterEmail)
    formData.append('instagramHandle', data.instagramHandle || '')
    formData.append('termsAccepted', 'true')
    formData.append('photoTitles', JSON.stringify(titles))
    formData.append('photoCategories', JSON.stringify(cats))
    formData.append('photoGears', JSON.stringify(gears))
    files.forEach((file) => formData.append('photos', file))

    setSubmitting(true)
    try {
      await submitPhotos(formData)
      setSubmitted(true)
    } catch (err) {
      addToast(err.response?.data?.message || 'Submission failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!exhibition) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="text-red-600">Exhibition not found.</p>
        </div>
      </PageWrapper>
    )
  }

  if (!isSubmissionOpen(exhibition.submissionStartDate, exhibition.submissionEndDate)) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Submissions Closed</h2>
          <p className="text-gray-500">The submission window for this exhibition is not currently open.</p>
          <Link to={`/exhibitions/${id}`} className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to exhibition
          </Link>
        </div>
      </PageWrapper>
    )
  }

  if (submitted) {
    return (
      <PageWrapper>
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received!</h2>
          <p className="text-gray-500 mb-6">
            Thank you for submitting to <strong>{exhibition.title}</strong>. The organizer will
            review your submission and you will be notified by email.
          </p>
          <Link
            to={`/exhibitions/${id}`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Back to Exhibition
          </Link>
        </div>
      </PageWrapper>
    )
  }

  const categories = exhibition.categories || []
  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to={`/exhibitions/${id}`} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
            ← Back to exhibition
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Submit Your Photos</h1>
          <p className="text-gray-500 mt-1">{exhibition.title}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((c) => (
              <Badge key={c} variant="indigo" className="capitalize">{c}</Badge>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Your Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input type="text" autoComplete="name" {...register('submitterName')} className={inputClass} />
                {errors.submitterName && (
                  <p className="text-red-600 text-xs mt-1">{errors.submitterName.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <input
                  type="email"
                  autoComplete="email"
                  {...register('submitterEmail')}
                  onBlur={handleEmailBlur}
                  className={inputClass}
                />
                {errors.submitterEmail && (
                  <p className="text-red-600 text-xs mt-1">{errors.submitterEmail.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className={labelClass}>Instagram Handle (optional)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  {...register('instagramHandle')}
                  className={`${inputClass} pl-7`}
                  placeholder="yourhandle"
                />
              </div>
            </div>
          </div>

          {/* Per-category photo uploads */}
          {categories.map((cat) => (
            <div
              key={cat}
              className={`bg-white rounded-xl border p-6 space-y-4 ${
                partialCategories.includes(cat) ? 'border-amber-400' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 capitalize">{cat} Photo</h2>
                <span className="text-xs text-gray-400">Leave all fields empty to skip this category</span>
              </div>
              {partialCategories.includes(cat) && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800">
                  Please fill in all mandatory fields (photo title and file), or leave this entire category empty to skip it.
                </div>
              )}

              <div>
                <label className={labelClass}>Photo Title *</label>
                <input
                  type="text"
                  value={photoData[cat]?.title || ''}
                  onChange={(e) => updatePhotoField(cat, 'title', e.target.value)}
                  className={inputClass}
                  placeholder={`Title for your ${cat} photo`}
                />
              </div>

              <div>
                <label className={labelClass}>Camera Gear (optional)</label>
                <input
                  type="text"
                  value={photoData[cat]?.gear || ''}
                  onChange={(e) => updatePhotoField(cat, 'gear', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Canon EOS R5, 50mm f/1.8"
                />
              </div>

              <div>
                <label className={labelClass}>Upload Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => { fileRefs.current[cat] = el }}
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) updatePhotoField(cat, 'fileName', file.name)
                  }}
                  className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 w-full"
                  aria-label={`Upload ${cat} photo`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WebP, HEIC — max 20MB. You can take a photo directly on mobile.
                </p>
                {photoData[cat]?.fileName && (
                  <p className="text-xs text-green-600 mt-1">✓ {photoData[cat].fileName}</p>
                )}
              </div>
            </div>
          ))}

          {/* Terms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-4 max-h-32 overflow-y-auto">
              <p>By submitting your photos, you confirm that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>You are the original creator of all submitted photos.</li>
                <li>You grant the exhibition organizer the right to display your photos within this exhibition.</li>
                <li>Your photos do not infringe on any third-party rights.</li>
                <li>You consent to being contacted via your provided email regarding your submission.</li>
              </ul>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('termsAccepted')}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                aria-describedby="terms-error"
              />
              <span className="text-sm text-gray-700">
                I agree to the terms and conditions above *
              </span>
            </label>
            {errors.termsAccepted && (
              <p id="terms-error" className="text-red-600 text-xs mt-2">{errors.termsAccepted.message}</p>
            )}
          </div>

          {alreadySubmitted && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 text-sm text-amber-800">
              <strong>Already submitted.</strong> This email address has already been used to submit to this exhibition. Each person may submit only once.
            </div>
          )}

          <Button type="submit" loading={submitting} disabled={alreadySubmitted} size="lg" className="w-full">
            Submit Photos
          </Button>
        </form>
      </div>
    </PageWrapper>
  )
}
