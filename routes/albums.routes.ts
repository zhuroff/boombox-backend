import 'module-alias/register'
import { Router } from 'express'
import { AlbumsController } from '~/controllers/albums.controller'

const router = Router()

router.post('/', AlbumsController.list)
router.get('/:id', AlbumsController.single)
router.get('/:id/:booklet', AlbumsController.booklet)
router.patch('/:id/description', AlbumsController.description)
router.post('/:id/discogs', AlbumsController.discogs)

export default router
