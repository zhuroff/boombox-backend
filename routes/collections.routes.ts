import { Router } from 'express'
import controller from '~/controllers/collections.controller'

const router = Router()

router.post('/create', controller.create)
router.get('/', controller.list)
router.get('/:id', controller.single)
router.patch('/:id', controller.update)
router.delete('/:id', controller.remove)

export default router
