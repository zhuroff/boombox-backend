import { Router } from 'express'
import { ToyController } from '../controllers/toy.controller'

const router = Router()

router.get('/', ToyController.genres)
router.post('/', ToyController.years)

export default router
