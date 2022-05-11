import 'module-alias/register'
import { Router } from 'express'
import { TracksController } from '~/controllers/tracks.controller'

const router = Router()

router.get('/:id/lyrics', TracksController.getLyricsFromDB)
router.post('/lyrics', TracksController.getLyricsExternal)
router.patch('/:id/listened', TracksController.incrementListeningCounter)
router.patch('/:id/duration', TracksController.saveTrackDuration)
router.patch('/:id/lyrics', TracksController.saveLyrics)

export default router
