import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/embedded.controller'

const router = Router()

router.get('/:id', authChecker, controller.single)
router.post('/create', authChecker, controller.create)
router.post('/', authChecker, controller.getAllEmbedded)
router.delete('/:id', authChecker, controller.remove)

export default router
