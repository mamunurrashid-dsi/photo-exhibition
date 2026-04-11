import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../api/auth.api'
import { useToast } from '../../context/ToastContext'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'

function Avatar({ src, name }) {
  if (src) {
    return <img src={src} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
  }
  return (
    <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 font-bold text-3xl flex items-center justify-center border-4 border-white shadow-md">
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

export default function EditProfilePage() {
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('bio', bio.trim())
      if (fileRef.current?.files[0]) {
        formData.append('avatar', fileRef.current.files[0])
      }

      const res = await updateProfile(formData)
      updateUser({ name: res.data.user.name, avatarUrl: res.data.user.avatarUrl, bio: res.data.user.bio })
      addToast('Profile updated successfully!', 'success')
      navigate(`/users/${user._id}`)
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(`/users/${user._id}`)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Avatar */}
            <div>
              <label className={labelClass}>Profile Photo</label>
              <div className="flex items-center gap-4">
                <Avatar src={avatarPreview} name={name} />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handleFileChange}
                    className="block text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
                maxLength={100}
              />
            </div>

            {/* Bio */}
            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Tell people a bit about yourself..."
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading}>Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(`/users/${user._id}`)}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
