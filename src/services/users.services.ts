import { Request } from 'express'
import { validationResult } from 'express-validator'
import { User, UserDocument } from '../models/user.model'
import { UserDTO } from '../dto/user.dto'
import bcrypt from 'bcrypt'
import tokenService from './token.service'

export default {
  async registration(req: Request) {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw errors.array()
    }

    const { email, password, role, login }: UserDocument = req.body
    const candidateByEmail = await User.findOne({ email })
    const candidateByLogin = await User.findOne({ login })

    if (candidateByEmail || candidateByLogin) {
      throw { message: 'user.exist' }
    }

    const hashPassword = await bcrypt.hash(password, 3)
    const user = await User.create({ login, email, role, password: hashPassword })
    const userDTO = new UserDTO(user)
    return userDTO
  },
  async login(req: Request) {
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

    await tokenService.saveToken(userDTO._id, tokens.refreshToken)

    return { ...tokens, user: userDTO }
  },
  async getList() {
    const dbUsers = await User.find()
    
    if (!dbUsers) {
      throw { message: 'users.unexist' }
    }

    return dbUsers
  },
  async refresh(req: Request) {
    if (!req.cookies?.refreshToken) {
      throw { message: 'user.unauthorized' }
    }

    const { refreshToken } = req.cookies
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

    await tokenService.saveToken(userDTO._id, tokens.refreshToken)

    return { ...tokens, user: userDTO }
  }
}
