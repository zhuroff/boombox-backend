import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/cloud.controller'

const router = Router()

router.post('/images', authChecker, controller.getImages)
router.post('/image', authChecker, controller.getImage)
router.post('/track/duration', authChecker, controller.getTrackDuration)
router.post('/tracks/random', authChecker, controller.getRandomTracks)
router.post('/albums/random', authChecker, controller.getRandomAlbums)
router.post('/content', authChecker, controller.getFolderContent)

export default router
