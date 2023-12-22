import { Router } from 'express'
import controller from '../controllers/toy.controller'

const router = Router()

router.get('/', controller.genres)
router.post('/', controller.years)
router.get('/:id', controller.year)

export default router
