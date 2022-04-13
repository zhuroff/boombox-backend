import { Router } from 'express'
import { NewsController } from '~/controllers/news.controller'

const router = Router()

router.post('/', NewsController.list)

export default router
