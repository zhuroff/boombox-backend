import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import EmbeddedRepositoryContract from '../repositories/EmbeddedRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import EmbeddedService from '../services/EmbeddedService'
import EmbeddedController from '../controllers/EmbeddedController'

const embeddedRepository = new EmbeddedRepositoryContract()
const categoryRepository = new CategoryRepositoryContract()

const embeddedService = new EmbeddedService(embeddedRepository, categoryRepository)

const embeddedController = new EmbeddedController(embeddedService)
const router = Router()

router.get('/', authChecker, embeddedController.getPopulatedEmbeddedList)
router.get('/:id', authChecker, embeddedController.getPopulatedEmbedded)
router.post('/create', authChecker, embeddedController.createEmbedded)
router.delete('/:id', authChecker, embeddedController.removeEmbedded)

export default router
