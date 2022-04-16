import { Router } from 'express'
import { CollectionsController } from '~/controllers/collections.controller'

const router = Router()

// router.post('/create', controller.create)
router.get('/', CollectionsController.list)
router.get('/:id', CollectionsController.single)
router.patch('/:id', CollectionsController.update)
// router.delete('/:id', controller.remove)

export default router
