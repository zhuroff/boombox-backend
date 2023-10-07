import { Router } from 'express'
import { EmbeddedController } from '../controllers/embedded.controller'

const router = Router()

router.get('/:id', EmbeddedController.single)
router.post('/create', EmbeddedController.create)
router.post('/', EmbeddedController.getAllEmbedded)
router.post('/:id/delete', EmbeddedController.remove)

export default router
