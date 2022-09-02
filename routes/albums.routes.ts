import 'module-alias/register'
import { Router } from 'express'
import { AlbumsController } from '~/controllers/albums.controller'

const router = Router()

router.post('/', AlbumsController.list)
router.post('/undisposed', AlbumsController.undisposed)
router.get('/:id', AlbumsController.single)
router.get('/:id/:booklet', AlbumsController.booklet)
router.get('/:id/:booklet', AlbumsController.booklet)
router.patch('/:id/description', AlbumsController.description)

export default router
