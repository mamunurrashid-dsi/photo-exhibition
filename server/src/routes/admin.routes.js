import { Router } from 'express'
import { verifyToken } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'
import {
  getStats,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getExhibitions,
  deleteExhibition,
  getSubmissions,
  deleteSubmission,
  moderatePhoto,
} from '../controllers/admin.controller.js'

const router = Router()

router.use(verifyToken, requireRole('admin'))

router.get('/stats', getStats)
router.get('/users', getUsers)
router.get('/users/:id', getUser)
router.patch('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/exhibitions', getExhibitions)
router.delete('/exhibitions/:id', deleteExhibition)
router.get('/submissions', getSubmissions)
router.delete('/submissions/:id', deleteSubmission)
router.patch('/photos/:id/moderate', moderatePhoto)

export default router
