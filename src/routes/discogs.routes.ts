import { Router } from 'express'
import { DiscogsController } from '../controllers/discogs.controller'

const router = Router()

router.post('/', DiscogsController.getList)
router.get('/:id', DiscogsController.single)

export default router
