import cloudinary from '../config/cloudinary.js'

export async function deleteImage(publicId) {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('Cloudinary delete error:', err.message)
  }
}

export function getThumbnailUrl(imageUrl, width = 400) {
  if (!imageUrl) return ''
  return imageUrl.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}
