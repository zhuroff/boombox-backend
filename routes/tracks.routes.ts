import { Router } from 'express'
import controller from '~/controllers/tracks.controller'

const router = Router()

router.patch('/:id/listened', controller.incrementListeningCounter)
router.patch('/:id/duration', controller.saveTrackDuration)
router.patch('/:id/lyrics', controller.saveLyrics)
router.post('/lyrics', controller.getLyrics)

export default router
