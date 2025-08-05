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
router.get('/lyrics/search', authChecker, trackController.getTrackExternalLyrics)

router.post('/wave', authChecker, trackController.getWave)
router.post('/audio', authChecker, trackController.getAudio)
// -router.post('/lyrics', authChecker, trackController.getTrackExternalLyrics)
router.patch('/update', authChecker, trackController.updateTrack)
// router.patch('/:id/listened/update', authChecker, trackController.incrementListeningCounter)
// router.patch('/:id/duration/update', authChecker, trackController.saveTrackDuration)

export default router
