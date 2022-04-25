import { Router } from 'express'
import { RadioController } from '~/controllers/radio.controller'

const router = Router()

router.get('/', RadioController.savedStations)
router.post('/', RadioController.allStations)
// router.post('/create', FramesController.create)
// router.post('/', FramesController.list)
// router.post('/:id/delete', FramesController.remove)

export default router
