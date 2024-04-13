import { Router } from 'express'
import controller from '../controllers/radio.controller'

const router = Router()

router.post('/', controller.getStations)
router.post('/:id', controller.saveStation)
router.delete('/:id', controller.deleteStation)

export default router
