import { useNavigate } from 'react-router-dom'

function Stars({ value, max = 5 }) {
  const filled = Math.round(value)
  return (
    <span className="text-xs" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < filled ? 'text-amber-400' : 'text-gray-400'}>★</span>
      ))}
    </span>
  )
}

export default function PhotoCard({ photo, onClick }) {
  const navigate = useNavigate()
  const { title, submitterName, submitterUser, thumbnailUrl, imageUrl, cameraGear, avgRating, ratingCount } = photo

  return (
    <button
      onClick={onClick}
      className="group relative block w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg overflow-hidden"
      aria-label={`View photo: ${title}`}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={thumbnailUrl || imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white text-sm font-medium truncate">{title}</p>
        {submitterName && (
          <p
            className="text-white/70 text-xs truncate hover:text-white transition-colors"
            style={submitterUser ? { cursor: 'pointer' } : undefined}
            onClick={submitterUser ? (e) => { e.stopPropagation(); navigate(`/users/${submitterUser}`) } : undefined}
          >
            {submitterName}
          </p>
        )}
        {cameraGear && (
          <p className="text-white/50 text-xs truncate">{cameraGear}</p>
        )}
        {ratingCount > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Stars value={avgRating} />
            <span className="text-white/50 text-xs">({ratingCount})</span>
          </div>
        )}
      </div>
    </button>
  )
}