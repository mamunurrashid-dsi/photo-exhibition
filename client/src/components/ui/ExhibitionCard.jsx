import { Link, useNavigate } from 'react-router-dom'
import Badge from './Badge'
import { formatDateShort, isSubmissionOpen } from '../../utils/formatDate'
import { truncate } from '../../utils/truncate'

export default function ExhibitionCard({ exhibition }) {
  const navigate = useNavigate()
  const {
    _id,
    title,
    type,
    visibility,
    organizerName,
    createdBy,
    categories = [],
    submissionStartDate,
    submissionEndDate,
    exhibitionStartDate,
    exhibitionEndDate,
    coverImageUrl,
    status,
  } = exhibition

  const submissionOpen =
    type === 'online' && isSubmissionOpen(submissionStartDate, submissionEndDate)

  return (
    <Link
      to={`/exhibitions/${_id}`}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-snug">{truncate(title, 60)}</h3>
          <div className="flex flex-col gap-1 shrink-0">
            <Badge variant={type === 'online' ? 'indigo' : 'purple'}>{type}</Badge>
            {submissionOpen && <Badge variant="success">Open</Badge>}
          </div>
        </div>
        <p
          className="text-sm text-gray-500 mb-3 hover:text-indigo-600 transition-colors"
          style={createdBy?._id ? { cursor: 'pointer' } : undefined}
          onClick={createdBy?._id ? (e) => { e.preventDefault(); e.stopPropagation(); navigate(`/users/${createdBy._id}`) } : undefined}
        >
          {organizerName}
        </p>
        {type === 'online' ? (
          <p className="text-xs text-gray-400">
            Submissions: {formatDateShort(submissionStartDate)} – {formatDateShort(submissionEndDate)}
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            {formatDateShort(exhibitionStartDate)} – {formatDateShort(exhibitionEndDate)}
          </p>
        )}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="default">
                {cat}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="default">+{categories.length - 3}</Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
