import { Router } from 'express'
import { authValidator } from '../middleware/auth.validator'
import TokenRepositoryContract from '../repositories/TokenRepository'
import UserRepositoryContract from '../repositories/UserRepository'
import TokenService from '../services/TokenService'
import UserService from '../services/UserService'
import UserController from '../controllers/UserController'

const tokenRepository = new TokenRepositoryContract()
const userRepository = new UserRepositoryContract()

const tokenService = new TokenService(tokenRepository)
const userService = new UserService(userRepository, tokenService)

const userController = new UserController(userService)
const router = Router()

router.get('/', authValidator, userController.getRawUsers)
router.post('/create', authValidator, userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/refresh', authValidator, userController.refreshToken)
router.delete('/:id', authValidator, userController.removeUser)

export default router