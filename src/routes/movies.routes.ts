import { Router } from 'express'
import { MoviesController } from '../controllers/movies.controller'

const router = Router()

router.post('/', MoviesController.list)
router.post('/:id', MoviesController.item)

export default router
