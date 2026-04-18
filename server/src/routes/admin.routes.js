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
  moderateExhibition,
  getSubmissions,
  deleteSubmission,
  moderatePhoto,
  getGroupedSubmissions,
  getStalePhotos,
  deleteStalePhoto,
} from '../controllers/admin.controller.js'

const router = Router()

router.use(verifyToken, requireRole('admin'))

router.get('/stats', getStats)
router.get('/users', getUsers)
router.get('/users/:id', getUser)
router.patch('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.get('/exhibitions', getExhibitions)
router.patch('/exhibitions/:id/moderate', moderateExhibition)
router.delete('/exhibitions/:id', deleteExhibition)
router.get('/submissions', getSubmissions)
router.get('/submissions/grouped', getGroupedSubmissions)
router.delete('/submissions/:id', deleteSubmission)
router.get('/photos/stale', getStalePhotos)
router.delete('/photos/:id/stale', deleteStalePhoto)
router.patch('/photos/:id/moderate', moderatePhoto)

export default router
