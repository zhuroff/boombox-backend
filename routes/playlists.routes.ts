import { Router } from 'express'
import { PlaylistsController } from '~/controllers/playlists.controller'
// import upload from '~/middleware/upload'

const router = Router()

router.post('/', PlaylistsController.create)
router.get('/', PlaylistsController.list)
router.get('/:id', PlaylistsController.single)
router.patch('/:id', PlaylistsController.update)
router.patch('/:id/reorder', PlaylistsController.reorder)
// router.post('/:id/delete', controller.deletePlaylist)
// router.post(
//   '/:id/cover',
//   upload.single('cover'),
//   controller.upload
// )

export default router
