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
router.get('/audio/:path', authChecker, trackController.getTrackAudio)
router.get('/lyrics/search', authChecker, trackController.getTrackExternalLyrics)
router.get('/wave', authChecker, trackController.getWave)
router.patch('/update', authChecker, trackController.updateTrack)

export default router
