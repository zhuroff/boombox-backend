import 'module-alias/register'
import { Router } from 'express'
import { FramesController } from '~/controllers/frames.controller'

const router = Router()

router.get('/:id', FramesController.single)
router.post('/create', FramesController.create)
router.post('/', FramesController.list)
router.post('/:id/delete', FramesController.remove)

export default router
