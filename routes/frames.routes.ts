import { Router } from 'express'
import controller from '~/controllers/frames.controller'

const router = Router()

router.post('/create', controller.create)
router.post('/', controller.list)
router.post('/:id/delete', controller.remove)
router.get('/:id', controller.single)

export default router
