import { Router } from 'express'
import controller from '../controllers/tracks.controller'

const router = Router()

router.get('/:id/lyrics', controller.getLyrics)
router.post('/wave', controller.getWave)
router.post('/audio', controller.getAudio)
router.post('/lyrics', controller.getLyricsExternal)
router.patch('/:id/listened/update', controller.incrementListeningCounter)
router.patch('/:id/duration/update', controller.saveTrackDuration)
router.patch('/:id/lyrics', controller.saveLyrics)

export default router
