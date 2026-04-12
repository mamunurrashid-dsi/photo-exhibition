import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'
import { LIMITS } from '../config/configurations.js'

function createStorage(folder) {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `photo_exhibition/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
  })
}

const imageFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new Error('Only image files are allowed'))
}

export const coverUpload = multer({
  storage: createStorage('covers'),
  limits: { fileSize: LIMITS.MAX_COVER_FILE_SIZE },
  fileFilter: imageFilter,
})

export const submissionUpload = multer({
  storage: createStorage('submissions'),
  limits: { fileSize: LIMITS.MAX_PHOTO_FILE_SIZE },
  fileFilter: imageFilter,
})

export const avatarUpload = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: LIMITS.MAX_AVATAR_FILE_SIZE },
  fileFilter: imageFilter,
})