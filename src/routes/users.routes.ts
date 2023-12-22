import { Router } from 'express'
import { authValidator } from '../middleware/auth.validator'
import controller from '../controllers/users.controller'

const router = Router()

router.post('/registration', authValidator, controller.registration)
router.post('/login', controller.login)
router.get('/refresh', controller.refresh)

export default router