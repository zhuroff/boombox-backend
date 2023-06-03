import { Router } from 'express'
import { authValidator } from '../middleware/auth.validator'
import { UsersController } from '../controllers/users.controller'

const router = Router()

router.post('/registration', authValidator, UsersController.registration)
router.post('/login', UsersController.login)
router.get('/refresh', UsersController.refresh)

export default router