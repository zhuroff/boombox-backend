import { Router } from 'express'
import { CollectionsController } from '~/controllers/collections.controller'
import upload from '~/middleware/upload'

const router = Router()

router.post('/create', CollectionsController.create)
router.get('/', CollectionsController.list)
router.get('/:id', CollectionsController.single)
router.patch('/:id', CollectionsController.update)
router.patch('/:id/reorder', CollectionsController.reorder)
router.delete('/:id', CollectionsController.remove)
router.post('/:id/poster', upload.single('poster'), CollectionsController.upload)
router.post('/:id/avatar', upload.single('avatar'), CollectionsController.upload)

export default router
