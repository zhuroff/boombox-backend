import { Router } from 'express'
import controller from '~/controllers/tracks.controller'

const router = Router()

router.patch('/:id/listened', controller.incrementListeningCounter)
router.patch('/:id/duration', controller.saveTrackDuration)

export default router
