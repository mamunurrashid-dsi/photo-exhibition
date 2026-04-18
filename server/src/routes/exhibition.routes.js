import { Router } from 'express'
import { verifyToken } from '../middleware/auth.middleware.js'
import { coverUpload } from '../middleware/upload.middleware.js'
import {
  getExhibitions,
  getMyExhibitions,
  getExhibition,
  getPrivateExhibition,
  verifyPrivateAccess,
  getExhibitionGallery,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  toggleExhibitionStatus,
} from '../controllers/exhibition.controller.js'

const router = Router()

router.get('/', getExhibitions)
router.get('/private/:token', getPrivateExhibition)
router.post('/private/:token/verify', verifyPrivateAccess)
router.get('/mine', verifyToken, getMyExhibitions)
router.get('/:id', getExhibition)
router.get('/:id/gallery', getExhibitionGallery)
router.post('/', verifyToken, coverUpload.single('coverImage'), createExhibition)
router.put('/:id', verifyToken, coverUpload.single('coverImage'), updateExhibition)
router.patch('/:id/toggle-status', verifyToken, toggleExhibitionStatus)
router.delete('/:id', verifyToken, deleteExhibition)

export default router
