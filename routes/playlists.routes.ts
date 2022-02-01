import { Router } from 'express'
import controller from '~/controllers/playlists.controller'
import upload from '~/middleware/upload'

const router = Router()

router.post('/', controller.create)
router.get('/', controller.list)
router.get('/:id', controller.single)
router.patch('/:id', controller.update)
router.patch('/:id/order', controller.changeOrder)
router.post('/:id/delete', controller.deletePlaylist)
router.post(
  '/:id/cover',
  upload.single('cover'),
  controller.upload
)

export default router
