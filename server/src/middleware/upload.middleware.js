import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

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

export const coverUpload = multer({
  storage: createStorage('covers'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

export const submissionUpload = multer({
  storage: createStorage('submissions'),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

export const avatarUpload = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})
