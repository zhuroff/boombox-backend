import { Request } from 'express'
import { validationResult } from 'express-validator'
import { User } from '../models/user.model'
import { UserDTO } from '../dtos/user.dto'
import { UserDocument, UserResponse } from '../types/User'
import bcrypt from 'bcrypt'
import tokenService from './token.service'

class UserService {
  async registration(req: Request): Promise<UserResponse> {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw errors.array()
    }

    const { email, password }: Pick<UserDocument, 'email' | 'password'> = req.body
    const candidate = await User.findOne({ email })

    if (candidate) {
      throw { message: 'user.exist' }
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const user = await User.create({ email, password: hashPassword, role: 'listener' })
    const userDTO = new UserDTO(user)
    const tokens = tokenService.generateTokens({ ...userDTO })

    await tokenService.saveToken(userDTO.id, tokens.refreshToken)

    return { ...tokens, user: userDTO }
  }

  async login(req: Request): Promise<UserResponse> {
    const { email, password }: Pick<UserDocument, 'email' | 'password'> = req.body
    const dbUser = await User.findOne({ email })

    if (!dbUser) {
      throw { message: 'user.unexist' }
    }

    const isPasswordsEquals = await bcrypt.compare(password, dbUser.password)

    if (!isPasswordsEquals) {
      throw { message: 'user.unexist' }
    }

    const userDTO = new UserDTO(dbUser)
    const tokens = tokenService.generateTokens({ ...userDTO })

    await tokenService.saveToken(userDTO.id, tokens.refreshToken)

    return { ...tokens, user: userDTO }
  }

  async refresh(req: Request): Promise<UserResponse> {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      throw { message: 'user.unauthorized' }
    }

    const userData = tokenService.validateRefreshToken(refreshToken)
    const dbToken = await tokenService.findToken(refreshToken)

    if (!userData || !dbToken) {
      throw { message: 'user.unauthorized' }
    }

    const dbUser = await User.findById(userData['id'])

    if (!dbUser) {
      throw { message: 'user.unexist' }
    }

    const userDTO = new UserDTO(dbUser)
    const tokens = tokenService.generateTokens({ ...userDTO })

    await tokenService.saveToken(userDTO.id, tokens.refreshToken)

    return { ...tokens, user: userDTO }
  }
}

export default new UserService()