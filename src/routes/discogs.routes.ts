import { Router } from 'express'
import DiscogsRepositoryContract from '../repositories/DiscogsRepository'
import DiscogsService from '../services/DiscogsService'
import DiscogsController from '../controllers/DiscogsController'

const discogsRepository = new DiscogsRepositoryContract()
const discogsService = new DiscogsService(discogsRepository)
const discogsController = new DiscogsController(discogsService)
const router = Router()

router.post('/', discogsController.getDiscogsData)

export default router
