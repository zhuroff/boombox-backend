import { Router } from 'express'
import controller from '../controllers/cloud.controller'

const router = Router()

router.post('/images', controller.getImages)

export default router
