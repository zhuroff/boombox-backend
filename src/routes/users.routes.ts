import { Router } from 'express'
import { authValidator } from '../middleware/auth.validator'
import controller from '../controllers/users.controller'

const router = Router()

router.get('/', authValidator, controller.getList)
router.post('/registration', authValidator, controller.registration)
router.post('/login', controller.login)
router.post('/logout', controller.logout)
router.get('/refresh', authValidator, controller.refresh)

export default router