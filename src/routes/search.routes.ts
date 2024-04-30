import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/search.controller'

const router = Router()

router.post('/', authChecker, controller.search)

export default router
