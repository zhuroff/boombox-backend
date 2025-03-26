import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import TrackRepositoryContract from '../repositories/TrackRepository'
import TrackService from '../services/TrackService'
import TrackController from '../controllers/TrackController'

const trackRepository = new TrackRepositoryContract()
const trackService = new TrackService(trackRepository)
const trackController = new TrackController(trackService)
const router = Router()

router.get('/:id/lyrics', authChecker, trackController.getTrackLyrics)
router.post('/wave', authChecker, trackController.getWave)
router.post('/audio', authChecker, trackController.getAudio)
router.post('/lyrics', authChecker, trackController.getTrackExternalLyrics)
router.patch('/:id/listened/update', authChecker, trackController.incrementListeningCounter)
router.patch('/:id/duration/update', authChecker, trackController.saveTrackDuration)
router.patch('/:id/lyrics', authChecker, trackController.saveTrackLyrics)

export default router
