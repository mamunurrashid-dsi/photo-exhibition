import { Router } from 'express'
import { getPublicProfile } from '../controllers/user.controller.js'

const router = Router()

router.get('/:id', getPublicProfile)

export default router
