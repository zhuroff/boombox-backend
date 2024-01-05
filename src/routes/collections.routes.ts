import { Router } from 'express'
import controller from '../controllers/collections.controller'
import upload from '../middleware/upload'

const router = Router()

router.post('/create', controller.create)
router.patch('/update', controller.update)
router.post('/', controller.getCollectionsList)
router.get('/:id', controller.single)
router.patch('/:id/reorder', controller.reorder)
router.delete('/:id', controller.remove)
router.post('/:id/poster', upload.single('poster'), controller.upload)
router.post('/:id/avatar', upload.single('avatar'), controller.upload)

export default router
