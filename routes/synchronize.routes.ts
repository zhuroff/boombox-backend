import { Router } from 'express'
import controller from '~/controllers/synchronize.controller'

const router = Router()

router.post('/', controller.synchronize)
// router.post('/create', controller.create)

export default router
