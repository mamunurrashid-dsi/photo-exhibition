import { useEffect, useState } from 'react'
import { getExhibitions } from '../../api/exhibitions.api'
import ExhibitionCard from '../../components/ui/ExhibitionCard'
import Spinner from '../../components/ui/Spinner'
import PageWrapper from '../../components/layout/PageWrapper'

const TYPES = ['all', 'online', 'offline']
const STATUSES = ['all', 'active', 'closed']

export default function ExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('active')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 12 }
    if (type !== 'all') params.type = type
    if (status !== 'all') params.status = status
    if (search.trim()) params.search = search.trim()

    getExhibitions(params)
      .then((res) => {
        setExhibitions(res.data.exhibitions || [])
        setTotalPages(res.data.totalPages || 1)
      })
      .catch(() => setExhibitions([]))
      .finally(() => setLoading(false))
  }, [type, status, search, page])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exhibitions</h1>
        <p className="text-gray-500">Browse photography exhibitions from around the world.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Search exhibitions..."
          value={search}
          onChange={handleSearch}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Search exhibitions"
        />
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1) }}
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
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
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
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : exhibitions.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No exhibitions found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitions.map((ex) => (
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
