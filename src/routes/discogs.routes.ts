import { Router } from 'express'
import { DiscogsController } from '../controllers/discogs.controller'

const router = Router()

router.post('/', DiscogsController.list)
router.get('/:id', DiscogsController.single)

export default router
