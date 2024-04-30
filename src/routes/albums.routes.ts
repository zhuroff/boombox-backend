import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/albums.controller'

const router = Router()

router.post('/', authChecker, controller.getList)
router.get('/', authChecker, controller.getListRandom)
router.get('/:id', authChecker, controller.getSingle)

export default router
