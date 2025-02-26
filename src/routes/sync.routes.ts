import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import { syncController as controller } from '../controllers/sync.controller'

const router = Router()

router.post('/', authChecker, controller.sync)
// router.post('/', authChecker, controller.addIds)

export default router
