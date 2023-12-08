import { Router } from 'express'
import controller from '../controllers/albums.controller'

const router = Router()

router.post('/', controller.getAlbumsList)
router.get('/', controller.getRandomAlbums)
router.get('/:id', controller.getSingleAlbum)

export default router
