import { useState } from 'react'
import PhotoCard from '../ui/PhotoCard'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function GalleryGrid({ photos, categories }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState(-1)

  const filtered =
    activeCategory === 'all' ? photos : photos.filter((p) => p.category === activeCategory)

  const slides = filtered.map((p) => ({
    src: p.imageUrl,
    title: p.title,
    submitterName: p.submitterName,
    cameraGear: p.cameraGear,
  }))

  return (
    <div>
      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({photos.length})
          </button>
          {categories.map((cat) => {
            const count = photos.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
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

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No photos in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((photo, idx) => (
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
