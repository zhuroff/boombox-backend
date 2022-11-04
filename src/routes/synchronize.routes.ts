import { Router } from 'express'
import controller from '../controllers/synchronize.controller'

const router = Router()

router.post('/', controller.synchronize)

export default router
