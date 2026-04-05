import { useState, useMemo } from 'react'
import PhotoCard from '../ui/PhotoCard'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function GalleryGrid({ photos, categories }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  // Step 1 — text search across title, submitter name, camera gear
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

  // Step 2 — category filter on top of search results
  const displayed =
    activeCategory === 'all' ? searched : searched.filter((p) => p.category === activeCategory)

  const slides = displayed.map((p) => ({
    src: p.imageUrl,
    title: p.title,
    submitterName: p.submitterName,
    cameraGear: p.cameraGear,
  }))

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setLightboxIndex(-1)
  }

  return (
    <div>
      {/* Search box */}
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

      {/* Category tabs — counts reflect current search results */}
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
        styles={{ slide: { paddingBottom: '80px' } }}
        render={{
          slideFooter: ({ slide }) => (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'rgba(0,0,0,0.75)',
                padding: '0 24px',
              }}
            >
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0, textAlign: 'center' }}>
                {slide.title}
              </p>
              {(slide.submitterName || slide.cameraGear) && (
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', margin: 0, textAlign: 'center' }}>
                  {[slide.submitterName, slide.cameraGear].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          ),
        }}
      />
    </div>
  )
}