import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/albums.controller'

const router = Router()

router.post('/', authChecker, controller.getAlbums)
router.get('/', authChecker, controller.getAlbumsRandom)
router.get('/:id', authChecker, controller.getAlbum)

export default router
