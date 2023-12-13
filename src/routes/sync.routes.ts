import { Router } from 'express'
import { syncController as controller } from '../controllers/sync.controller'

const router = Router()

router.post('/', controller.sync)

export default router
