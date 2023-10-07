import { Router } from 'express'
import { AlbumsController } from '../controllers/albums.controller'

const router = Router()

router.post('/', AlbumsController.getAlbumsList)
router.get('/', AlbumsController.getRandomAlbums)
router.get('/:id', AlbumsController.getSingleAlbum)
router.get('/:id/:booklet', AlbumsController.getAlbumBooklet)

export default router
