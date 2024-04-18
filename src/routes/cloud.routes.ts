import { Router } from 'express'
import controller from '../controllers/cloud.controller'

const router = Router()

router.post('/images', controller.getImages)
router.post('/image', controller.getImage)
router.post('/track/duration', controller.getTrackDuration)
router.post('/track/random', controller.getRandomTracks)
router.post('/content', controller.getFolderContent)

export default router
