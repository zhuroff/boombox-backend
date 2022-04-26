import { Router } from 'express'
import { RadioController } from '~/controllers/radio.controller'

const router = Router()

router.get('/', RadioController.savedStations)
router.post('/', RadioController.allStations)
router.post('/:id', RadioController.saveStation)
router.delete('/:id', RadioController.deleteStation)

export default router
