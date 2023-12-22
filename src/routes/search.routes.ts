import { Router } from 'express'
import controller from '../controllers/search.controller'

const router = Router()

router.post('/', controller.search)

export default router
