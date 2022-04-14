import { Router } from 'express'
import controller from '~/controllers/tracks.controller'

const router = Router()

router.get('/:id/lyrics', controller.getLyricsFromDB)
router.post('/lyrics', controller.getLyricsExternal)
router.patch('/:id/listened', controller.incrementListeningCounter)
router.patch('/:id/duration', controller.saveTrackDuration)
router.patch('/:id/lyrics', controller.saveLyrics)

export default router
