export default function PhotoCard({ photo, onClick }) {
  const { title, submitterName, thumbnailUrl, imageUrl, cameraGear } = photo

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
          <p className="text-white/70 text-xs truncate">{submitterName}</p>
        )}
        {cameraGear && (
          <p className="text-white/50 text-xs truncate">{cameraGear}</p>
        )}
      </div>
    </button>
  )
}
