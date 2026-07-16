import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import DiscogsRepositoryContract from '../repositories/DiscogsRepository'
import DiscogsService from '../services/DiscogsService'
import DiscogsController from '../controllers/DiscogsController'

const discogsRepository = new DiscogsRepositoryContract()
const discogsService = new DiscogsService(discogsRepository)
const discogsController = new DiscogsController(discogsService)
const router = Router()

router.get('/collection', authChecker, discogsController.getCollection)
router.get('/search', authChecker, discogsController.searchDiscogsData)

export default router
