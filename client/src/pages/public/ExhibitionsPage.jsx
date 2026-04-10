import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getExhibitions } from '../../api/exhibitions.api'
import { useAuth } from '../../context/AuthContext'
import ExhibitionCard from '../../components/ui/ExhibitionCard'
import Spinner from '../../components/ui/Spinner'
import PageWrapper from '../../components/layout/PageWrapper'

const TYPES = ['all', 'online', 'offline']
const STATUSES = ['all', 'active', 'closed']
const PAGE_SIZE = 12

export default function ExhibitionsPage() {
  const { user } = useAuth()
  const [allExhibitions, setAllExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('active')
  const [acceptingOnly, setAcceptingOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Load everything once — no server round-trips for search/filter
  useEffect(() => {
    getExhibitions({ limit: 1000 })
      .then((res) => setAllExhibitions(res.data.exhibitions || []))
      .catch(() => setAllExhibitions([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const now = new Date()
    return allExhibitions.filter((ex) => {
      if (type !== 'all' && ex.type !== type) return false
      if (status !== 'all' && ex.status !== status) return false
      if (acceptingOnly) {
        if (ex.type !== 'online') return false
        if (ex.status !== 'active') return false
        if (ex.submissionStartDate && new Date(ex.submissionStartDate) > now) return false
        if (ex.submissionEndDate && new Date(ex.submissionEndDate) < now) return false
      }
      if (q) {
        return (
          ex.title?.toLowerCase().includes(q) ||
          ex.organizerName?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [allExhibitions, type, status, acceptingOnly, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const setFilter = (setter) => (val) => {
    setter(val)
    setPage(1)
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exhibitions</h1>
          <p className="text-gray-500">Browse photography exhibitions from around the world.</p>
        </div>
        <Link
          to={user ? '/dashboard/exhibitions/new' : '/login'}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Create Exhibition
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Search by title or organizer..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Search exhibitions"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">Type</span>
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(setType)(t)}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors capitalize ${
                type === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">Status</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(setStatus)(s); if (s !== 'active') setAcceptingOnly(false) }}
              className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors capitalize ${
                status === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          role="switch"
          aria-checked={acceptingOnly}
          onClick={() => { const next = !acceptingOnly; setAcceptingOnly(next); if (next) setStatus('active'); setPage(1) }}
          className="shrink-0 flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 transition-colors duration-200 ${acceptingOnly ? 'bg-green-500 border-green-500' : 'bg-gray-200 border-gray-200'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${acceptingOnly ? 'translate-x-4' : 'translate-x-0'}`} />
          </span>
          <span className={`text-sm font-medium transition-colors ${acceptingOnly ? 'text-green-600' : 'text-gray-600'}`}>
            Accepting Submissions
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No exhibitions found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((ex) => (
              <ExhibitionCard key={ex._id} exhibition={ex} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}