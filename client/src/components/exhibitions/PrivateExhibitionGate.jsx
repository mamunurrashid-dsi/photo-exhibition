import { useState } from 'react'
import { checkPrivateAccess } from '../../api/exhibitions.api'
import Button from '../ui/Button'
import { isValidEmail, getEmailDomain } from '../../utils/validateEmail'

export default function PrivateExhibitionGate({ token, allowedEmailDomain, onAccessGranted }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (allowedEmailDomain && getEmailDomain(email) !== allowedEmailDomain) {
      setError(`Access is restricted to @${allowedEmailDomain} email addresses.`)
      return
    }

    setLoading(true)
    try {
      await checkPrivateAccess(token, email)
      onAccessGranted(email)
    } catch (err) {
      setError(err.response?.data?.message || 'Access denied.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 w-full max-w-md text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Private Exhibition</h2>
        <p className="text-gray-500 text-sm mb-6">
          This exhibition is invite-only.
          {allowedEmailDomain
            ? ` Access requires an @${allowedEmailDomain} email address.`
            : ' Enter your email to verify access.'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Email address"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Verify Access
          </Button>
        </form>
      </div>
    </div>
  )
}
