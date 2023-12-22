import { Router } from 'express'
import controller from '../controllers/compilations.controller'
import upload from '../middleware/upload'

const router = Router()

router.post('/', controller.create)
router.get('/', controller.getAllPlaylists)
router.get('/:id', controller.single)
router.patch('/:id', controller.update)
router.patch('/:id/reorder', controller.reorder)
router.patch('/:id/rename', controller.rename)
router.delete('/:id', controller.remove)
router.post('/:id/poster', upload.single('poster'), controller.upload)
router.post('/:id/avatar', upload.single('avatar'), controller.upload)

export default router
