import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PhotoCard from '../ui/PhotoCard'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

function Stars({ value, max = 5 }) {
  const filled = Math.round(value)
  return (
    <span aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < filled ? '#fbbf24' : 'rgba(255,255,255,0.25)' }}>★</span>
      ))}
    </span>
  )
}

export default function GalleryGrid({ photos, categories }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const searched = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return photos
    return photos.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.submitterName?.toLowerCase().includes(q) ||
        p.cameraGear?.toLowerCase().includes(q)
    )
  }, [photos, searchQuery])

  const displayed =
    activeCategory === 'all' ? searched : searched.filter((p) => p.category === activeCategory)

  const slides = displayed.map((p) => ({
    src: p.imageUrl,
    photoId: p._id,
    title: p.title,
    submitterName: p.submitterName,
    submitterUser: p.submitterUser,
    cameraGear: p.cameraGear,
    avgRating: p.avgRating || 0,
    ratingCount: p.ratingCount || 0,
    exhibitionId: p.exhibition?._id || (typeof p.exhibition === 'string' ? p.exhibition : null),
    exhibitionTitle: p.exhibition?.title,
  }))

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setLightboxIndex(-1)
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by title, photographer, or camera gear..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory('all'); setLightboxIndex(-1) }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Search photos"
        />
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({searched.length})
          </button>
          {categories.map((cat) => {
            const count = searched.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors capitalize ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      )}

      {displayed.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          {searchQuery.trim() ? 'No photos match your search.' : 'No photos in this category yet.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayed.map((photo, idx) => (
            <PhotoCard key={photo._id} photo={photo} onClick={() => setLightboxIndex(idx)} />
          ))}
        </div>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        slides={slides}
        index={lightboxIndex}
        styles={{ slide: { paddingBottom: '100px' } }}
        render={{
          slideFooter: ({ slide }) => (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'rgba(0,0,0,0.80)',
                padding: '12px 24px',
              }}
            >
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                {slide.title}
              </p>
              {slide.exhibitionId && slide.exhibitionTitle && (
                <Link
                  to={`/exhibitions/${slide.exhibitionId}`}
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: 0 }}
                >
                  {slide.exhibitionTitle}
                </Link>
              )}
              {(slide.submitterName || slide.cameraGear) && (
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', margin: 0, textAlign: 'center' }}>
                  {slide.submitterUser ? (
                    <Link
                      to={`/users/${slide.submitterUser}`}
                      style={{ color: 'rgba(165,180,252,0.9)' }}
                    >
                      {slide.submitterName}
                    </Link>
                  ) : slide.submitterName}
                  {slide.submitterName && slide.cameraGear && ' · '}
                  {slide.cameraGear}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                <Stars value={slide.avgRating} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                  {slide.ratingCount > 0
                    ? `${slide.avgRating.toFixed(1)} (${slide.ratingCount})`
                    : 'No ratings yet'}
                </span>
              </div>
              <Link
                to={`/photos/${slide.photoId}`}
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#a5b4fc',
                  cursor: 'pointer',
                }}
              >
                Rate &amp; Comments
              </Link>
            </div>
          ),
        }}
      />
    </div>
  )
}