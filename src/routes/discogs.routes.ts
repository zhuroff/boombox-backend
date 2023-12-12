import { Router } from 'express'
import controller from '../controllers/discogs.controller'

const router = Router()

router.post('/', controller.getList)

export default router
