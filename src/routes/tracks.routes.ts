import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/tracks.controller'

const router = Router()

router.get('/:id/lyrics', authChecker, controller.getLyrics)
router.post('/wave', authChecker, controller.getWave)
router.post('/audio', authChecker, controller.getAudio)
router.post('/lyrics', authChecker, controller.getLyricsExternal)
router.patch('/:id/listened/update', authChecker, controller.incrementListeningCounter)
router.patch('/:id/duration/update', authChecker, controller.saveTrackDuration)
router.patch('/:id/lyrics', authChecker, controller.saveLyrics)

export default router
