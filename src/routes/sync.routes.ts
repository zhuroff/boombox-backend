import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import { controller } from '../controllers/sync.controller'

const router = Router()

router.post('/', authChecker, controller.sync)

export default router
