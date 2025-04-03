import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import TOYRepositoryContracts from '../repositories/TOYRespository'
import TOYService from '../services/TOYService'
import TOYController from '../controllers/TOYController'

const toyRepository = new TOYRepositoryContracts()
const toyService = new TOYService(toyRepository)
const toyController = new TOYController(toyService)

const router = Router()

router.post('/images', authChecker, toyController.getCloudImages)
router.post('/image', authChecker, toyController.getCloudImage)
router.post('/track/duration', authChecker, toyController.getTrackDuration)
router.post('/tracks/random', authChecker, toyController.getRandomTracks)
router.post('/albums/random', authChecker, toyController.getRandomAlbums)
router.post('/content', authChecker, toyController.getFolderContent)

export default router
