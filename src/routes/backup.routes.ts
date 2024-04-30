import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/backup.controller'

const router = Router()

router.get('/', authChecker, controller.get)
router.post('/save', authChecker, controller.save)
router.post('/restore/:date', authChecker, controller.recover)
router.delete('/:date', authChecker, controller.remove)

export default router
