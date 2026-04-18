import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminGroupedSubmissions } from '../../api/admin.api'
import PageWrapper from '../../components/layout/PageWrapper'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../context/ToastContext'
import { formatDateShort } from '../../utils/formatDate'

const TYPE_BADGE = { online: 'indigo', offline: 'purple' }
const STATUS_BADGE = {
  active: 'success',
  pending_approval: 'warning',
  rejected: 'danger',
  closed: 'default',
  archived: 'default',
  draft: 'default',
}

export default function AdminSubmissionsPage() {
  const { addToast } = useToast()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminGroupedSubmissions()
      .then((res) => setGroups(res.data.groups || []))
      .catch(() => addToast('Failed to load submissions', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const totalSubmissions = groups.reduce((sum, g) => sum + g.total, 0)
  const totalPending = groups.reduce((sum, g) => sum + g.pending, 0)

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        {totalPending > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {totalPending} pending
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {totalSubmissions} total submissions across {groups.length} exhibition{groups.length !== 1 ? 's' : ''}.
        Click an exhibition to manage its submissions directly.
      </p>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl">No submissions yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Exhibition', 'Type', 'Status', 'Pending', 'Approved', 'Rejected', 'Total', 'Latest'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map(({ exhibition, total, pending, approved, rejected, latestSubmittedAt }) => (
                  <tr key={exhibition._id} className={`hover:bg-gray-50 ${pending > 0 ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/exhibitions/${exhibition._id}/submissions`}
                        className="text-sm font-medium text-indigo-600 hover:underline"
                      >
                        {exhibition.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={TYPE_BADGE[exhibition.type] || 'default'}>{exhibition.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[exhibition.status] || 'default'}>
                        {exhibition.status === 'pending_approval' ? 'Pending Approval' : exhibition.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {pending > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          {pending}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${approved > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                        {approved}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${rejected > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {rejected}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{total}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateShort(latestSubmittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
