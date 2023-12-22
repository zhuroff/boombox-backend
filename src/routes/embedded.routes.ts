import { Router } from 'express'
import controller from '../controllers/embedded.controller'

const router = Router()

router.get('/:id', controller.single)
router.post('/create', controller.create)
router.post('/', controller.getAllEmbedded)
router.post('/:id/delete', controller.remove)

export default router
