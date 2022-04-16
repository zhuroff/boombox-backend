import { Router } from 'express'
import { CollectionsController } from '~/controllers/collections.controller'

const router = Router()

// router.post('/create', controller.create)
router.get('/', CollectionsController.list)
router.get('/:id', CollectionsController.single)
// router.patch('/:id', controller.update)
// router.delete('/:id', controller.remove)

export default router
