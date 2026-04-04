import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { verifyToken } from '../middleware/auth.middleware.js'
import { submissionUpload } from '../middleware/upload.middleware.js'
import {
  createSubmission,
  checkDuplicateSubmission,
  getSubmissions,
  getSubmission,
  approveSubmission,
  rejectSubmission,
  deleteSubmission,
} from '../controllers/submission.controller.js'

const router = Router()

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many submissions from this IP. Please try again later.' },
})

router.post('/', verifyToken, uploadLimiter, submissionUpload.array('photos', 20), createSubmission)
router.get('/check', checkDuplicateSubmission)
router.get('/exhibition/:exhibitionId', verifyToken, getSubmissions)
router.get('/:id', verifyToken, getSubmission)
router.patch('/:id/approve', verifyToken, approveSubmission)
router.patch('/:id/reject', verifyToken, rejectSubmission)
router.delete('/:id', verifyToken, deleteSubmission)

export default router
