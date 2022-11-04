import { Router } from 'express'
import { PlaylistsController } from '../controllers/playlists.controller'
import upload from '../middleware/upload'

const router = Router()

router.post('/', PlaylistsController.create)
router.get('/', PlaylistsController.list)
router.get('/:id', PlaylistsController.single)
router.patch('/:id', PlaylistsController.update)
router.patch('/:id/reorder', PlaylistsController.reorder)
router.patch('/:id/rename', PlaylistsController.rename)
router.delete('/:id', PlaylistsController.remove)
router.post('/:id/poster', upload.single('poster'), PlaylistsController.upload)
router.post('/:id/avatar', upload.single('avatar'), PlaylistsController.upload)

export default router
