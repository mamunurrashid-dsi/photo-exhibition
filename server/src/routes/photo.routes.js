import { Router } from 'express'
import { verifyToken } from '../middleware/auth.middleware.js'
import { getPhoto, ratePhoto, getMyRating, getComments, addComment } from '../controllers/photo.controller.js'

const router = Router()

router.get('/:id', getPhoto)
router.post('/:id/rate', verifyToken, ratePhoto)
router.get('/:id/my-rating', verifyToken, getMyRating)
router.get('/:id/comments', getComments)
router.post('/:id/comments', verifyToken, addComment)

export default router