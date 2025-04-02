import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { validationResult } from 'express-validator'
import { UserDataPayload, UserRepository } from '../types/common.types'
import TokenService from './TokenService'
import UserView from '../views/UserView'
import bcrypt from 'bcrypt'

export default class UserService {
  constructor(
    private userRepository: UserRepository,
    private tokenService: TokenService
  ) {}

  async registration(req: Request<{}, {}, UserDataPayload>) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw errors.array()
    }

    const { email, password, role, login } = req.body

    const candidateByEmail = await this.userRepository.findUser({ email })
    const candidateByLogin = await this.userRepository.findUser({ login })

    if (candidateByEmail || candidateByLogin) {
      throw { message: 'user.exist' }
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const createdUser = await this.userRepository.createUser({
      login,
      email,
      role,
      password: hashPassword
    })

    return new UserView(createdUser)
  }

  async login(req: Request<{}, {}, UserDataPayload>) {
    const { email, password } = req.body

    const userByEmail = await this.userRepository.findUser({ email })

    if (!userByEmail) {
      throw { message: 'user.unexist' }
    }

    const isPasswordsEquals = await bcrypt.compare(password, userByEmail.password)

    if (!isPasswordsEquals) {
      throw { message: 'password.incorrect' }
    }

    const user = new UserView(userByEmail)
    const tokens = this.tokenService.generateTokens({ ...user })

    await this.tokenService.saveToken(user._id, tokens.refreshToken)

    return { ...tokens, user }
  }

  async logout(req: Request, res: Response) {
    if (!req.cookies?.['refreshToken']) {
      throw { message: 'user.unauthorized' }
    }

    const { refreshToken } = req.cookies
    res.clearCookie('refreshToken')
    
    return await this.tokenService.removeToken(refreshToken)
  }

  async getRawUsers() {
    const users = await this.userRepository.getRawUsers()

    if (!users) {
      throw { message: 'users.unexist' }
    }

    return users
  }

  async getUser(req: Request | Types.ObjectId) {
    const payload = req instanceof Types.ObjectId ? { _id: req } : req.body
    return await this.userRepository.findUser(payload)
  }

  async refreshToken(req: Request) {
    if (!req.cookies?.['refreshToken']) {
      throw { message: 'user.unauthorized' }
    }

    const { refreshToken } = req.cookies
    const userData = this.tokenService.validateRefreshToken(refreshToken)
    const dbToken = await this.tokenService.getToken(refreshToken)

    if (!userData || !dbToken) {
      throw { message: 'user.unauthorized' }
    }

    const user = await this.getUser(userData['_id'])

    if (!user) {
      throw { message: 'user.unexist' }
    }

    const userDTO = new UserView(user)
    const tokens = this.tokenService.generateTokens({ ...userDTO })

    await this.tokenService.saveToken(userDTO._id, tokens.refreshToken)

    return { ...tokens, user: userDTO }
  }

  async removeUser(req: Request, res: Response) {
    if (!req.cookies?.['refreshToken']) {
      throw { message: 'user.unauthorized' }
    }

    if (!req.params['id']) {
      throw { message: 'required.userId' }
    }

    const { refreshToken } = req.cookies
    res.clearCookie('refreshToken')

    await this.tokenService.removeToken(refreshToken)
    await this.userRepository.removeUser(req.params['id'])

    return { message: 'user.deleted' }
  }
}
 