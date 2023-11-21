import { Router } from 'express'
import { CloudController } from '../controllers/cloud.controller'

const router = Router()

router.post('/images', CloudController.getImages)

export default router
