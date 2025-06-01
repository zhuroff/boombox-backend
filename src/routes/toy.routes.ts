import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import TOYRepositoryContracts from '../repositories/TOYRespository'
import TOYService from '../services/TOYService'
import TOYController from '../controllers/TOYController'

const toyRepository = new TOYRepositoryContracts()
const toyService = new TOYService(toyRepository)
const toyController = new TOYController(toyService)

const router = Router()

router.get('/', authChecker, toyController.getTOYList)
router.get('/:genre', authChecker, toyController.getTOYList)
router.get('/:genre/:year', authChecker, toyController.getTOYAlbum)
router.get('/:genre/:year/:folder', authChecker, toyController.getTOYContent)

export default router
