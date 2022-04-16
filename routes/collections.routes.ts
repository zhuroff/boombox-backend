import { Router } from 'express'
import { CollectionsController } from '~/controllers/collections.controller'

const router = Router()

router.post('/create', CollectionsController.create)
router.get('/', CollectionsController.list)
router.get('/:id', CollectionsController.single)
router.patch('/:id', CollectionsController.update)
router.patch('/:id/reorder', CollectionsController.reorder)
router.delete('/:id', CollectionsController.remove)

export default router
