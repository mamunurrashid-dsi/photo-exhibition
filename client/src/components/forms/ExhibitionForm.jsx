import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Button from '../ui/Button'

// Single permissive schema — type-specific required fields validated manually
// .nullish() used for fields that may come back as null from the server
const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  organizerName: z.string().min(2, 'Organizer name is required'),
  description: z.string().nullish(),
  visibility: z.enum(['public', 'private']).nullish(),
  allowedEmailDomain: z.string().nullish(),
  allowSubmissionFromOthers: z.boolean().nullish(),
  submissionStartDate: z.string().nullish(),
  submissionEndDate: z.string().nullish(),
  venueAddress: z.string().nullish(),
  venueCity: z.string().nullish(),
  venueCountry: z.string().nullish(),
  venueMapLink: z.string().nullish(),
  exhibitionStartDate: z.string().nullish(),
  exhibitionEndDate: z.string().nullish(),
})

export default function ExhibitionForm({ defaultValues = {}, onSubmit, loading }) {
  const [type, setType] = useState(defaultValues.type || 'online')
  const [categories, setCategories] = useState(defaultValues.categories || [])
  const [categoryInput, setCategoryInput] = useState('')
  const [coverPreview, setCoverPreview] = useState(defaultValues.coverImageUrl || null)
  const fileRef = useRef()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const addCategory = () => {
    const val = categoryInput.trim().toLowerCase()
    if (val && !categories.includes(val)) {
      setCategories([...categories, val])
    }
    setCategoryInput('')
  }

  const removeCategory = (cat) => setCategories(categories.filter((c) => c !== cat))

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) setCoverPreview(URL.createObjectURL(file))
  }

  const handleFormSubmit = (data) => {
    // Manual validation for type-specific required fields
    let hasError = false
    if (type === 'online') {
      if (!data.submissionStartDate) { setError('submissionStartDate', { message: 'Start date is required' }); hasError = true }
      if (!data.submissionEndDate) { setError('submissionEndDate', { message: 'End date is required' }); hasError = true }
    } else {
      if (!data.venueAddress?.trim()) { setError('venueAddress', { message: 'Venue address is required' }); hasError = true }
      if (!data.exhibitionStartDate) { setError('exhibitionStartDate', { message: 'Start date is required' }); hasError = true }
      if (!data.exhibitionEndDate) { setError('exhibitionEndDate', { message: 'End date is required' }); hasError = true }
    }
    if (hasError) return

    const formData = new FormData()
    formData.append('type', type)
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') formData.append(k, v)
    })
    formData.append('categories', JSON.stringify(categories))
    if (fileRef.current?.files[0]) {
      formData.append('coverImage', fileRef.current.files[0])
    }
    onSubmit(formData)
  }

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const errorClass = 'text-red-600 text-xs mt-1'

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Type toggle */}
      <div>
        <p className={labelClass}>Exhibition Type</p>
        <div className="flex gap-3">
          {['online', 'offline'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                type === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t === 'online' ? '🌐 Online' : '📍 Offline'}
            </button>
          ))}
        </div>
      </div>

      {/* Shared fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Exhibition Title *</label>
          <input type="text" {...register('title')} className={inputClass} />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>
        <div>
          <label className={labelClass}>{type === 'online' ? 'Company / Organizer Name' : 'Organizer Name'} *</label>
          <input type="text" {...register('organizerName')} className={inputClass} />
          {errors.organizerName && <p className={errorClass}>{errors.organizerName.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className={inputClass}
          placeholder="Brief description of the exhibition..."
        />
      </div>

      {/* Cover image */}
      <div>
        <label className={labelClass}>Cover Image</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {coverPreview && (
            <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleCoverChange}
              className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              aria-label="Upload cover image"
            />
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, HEIC up to 10MB</p>
          </div>
        </div>
      </div>

      {/* Online-only fields */}
      {type === 'online' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Visibility *</label>
              <select {...register('visibility')} className={inputClass}>
                <option value="public">Public — listed on the website</option>
                <option value="private">Private — accessible via unique link only</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Allowed Email Domain (optional)</label>
              <input
                type="text"
                {...register('allowedEmailDomain')}
                placeholder="company.com"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">
                Restrict access to viewers with this email domain. Leave blank for any email.
              </p>
            </div>
          </div>

          {/* Submission access */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="allowSubmissionFromOthers"
              defaultChecked={defaultValues.allowSubmissionFromOthers !== false}
              {...register('allowSubmissionFromOthers')}
              className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div>
              <label htmlFor="allowSubmissionFromOthers" className="text-sm font-medium text-gray-700 cursor-pointer">
                Allow submissions from other users
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                When unchecked, only you (the organizer) can submit photos to this exhibition.
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className={labelClass}>Photo Categories</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addCategory() }
                }}
                placeholder="e.g. nature, street, wildlife"
                className={`${inputClass} flex-1`}
                aria-label="Add category"
              />
              <Button type="button" variant="secondary" onClick={addCategory}>
                Add
              </Button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategory(cat)}
                      className="text-indigo-400 hover:text-indigo-700"
                      aria-label={`Remove ${cat}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Submission Start Date *</label>
              <Controller
                name="submissionStartDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    dateFormat="dd-MM-yyyy"
                    selected={field.value ? (() => { const [y, mo, d] = field.value.split('-').map(Number); return new Date(y, mo - 1, d) })() : null}
                    onChange={(date) => {
                    if (!date) { field.onChange(''); return }
                    const y = date.getFullYear()
                    const m = String(date.getMonth() + 1).padStart(2, '0')
                    const d = String(date.getDate()).padStart(2, '0')
                    field.onChange(`${y}-${m}-${d}`)
                  }}
                    className={inputClass}
                    placeholderText="dd-mm-yyyy"
                    autoComplete="off"
                  />
                )}
              />
              {errors.submissionStartDate && (
                <p className={errorClass}>{errors.submissionStartDate.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Submission End Date *</label>
              <Controller
                name="submissionEndDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    dateFormat="dd-MM-yyyy"
                    selected={field.value ? (() => { const [y, mo, d] = field.value.split('-').map(Number); return new Date(y, mo - 1, d) })() : null}
                    onChange={(date) => {
                    if (!date) { field.onChange(''); return }
                    const y = date.getFullYear()
                    const m = String(date.getMonth() + 1).padStart(2, '0')
                    const d = String(date.getDate()).padStart(2, '0')
                    field.onChange(`${y}-${m}-${d}`)
                  }}
                    className={inputClass}
                    placeholderText="dd-mm-yyyy"
                    autoComplete="off"
                  />
                )}
              />
              {errors.submissionEndDate && (
                <p className={errorClass}>{errors.submissionEndDate.message}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Offline-only fields */}
      {type === 'offline' && (
        <>
          <div>
            <label className={labelClass}>Venue Address *</label>
            <input type="text" {...register('venueAddress')} className={inputClass} placeholder="123 Main St" />
            {errors.venueAddress && <p className={errorClass}>{errors.venueAddress.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input type="text" {...register('venueCity')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" {...register('venueCountry')} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Google Maps Link</label>
            <input
              type="url"
              {...register('venueMapLink')}
              className={inputClass}
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-gray-400 mt-1">Optional — paste a Google Maps share link for the venue.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Exhibition Start Date *</label>
              <Controller
                name="exhibitionStartDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    dateFormat="dd-MM-yyyy"
                    selected={field.value ? (() => { const [y, mo, d] = field.value.split('-').map(Number); return new Date(y, mo - 1, d) })() : null}
                    onChange={(date) => {
                    if (!date) { field.onChange(''); return }
                    const y = date.getFullYear()
                    const m = String(date.getMonth() + 1).padStart(2, '0')
                    const d = String(date.getDate()).padStart(2, '0')
                    field.onChange(`${y}-${m}-${d}`)
                  }}
                    className={inputClass}
                    placeholderText="dd-mm-yyyy"
                    autoComplete="off"
                  />
                )}
              />
              {errors.exhibitionStartDate && (
                <p className={errorClass}>{errors.exhibitionStartDate.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Exhibition End Date *</label>
              <Controller
                name="exhibitionEndDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    dateFormat="dd-MM-yyyy"
                    selected={field.value ? (() => { const [y, mo, d] = field.value.split('-').map(Number); return new Date(y, mo - 1, d) })() : null}
                    onChange={(date) => {
                    if (!date) { field.onChange(''); return }
                    const y = date.getFullYear()
                    const m = String(date.getMonth() + 1).padStart(2, '0')
                    const d = String(date.getDate()).padStart(2, '0')
                    field.onChange(`${y}-${m}-${d}`)
                  }}
                    className={inputClass}
                    placeholderText="dd-mm-yyyy"
                    autoComplete="off"
                  />
                )}
              />
              {errors.exhibitionEndDate && (
                <p className={errorClass}>{errors.exhibitionEndDate.message}</p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="pt-2">
        <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
          {defaultValues._id ? 'Save Changes' : 'Create Exhibition'}
        </Button>
      </div>
    </form>
  )
}
