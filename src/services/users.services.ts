import { Request, Response } from 'express'
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

    try {
      const { email, password, role, login }: UserDocument = req.body
      const candidateByEmail = await User.findOne({ email })
      const candidateByLogin = await User.findOne({ login })

      if (candidateByEmail || candidateByLogin) {
        throw { message: 'user.exist' }
      }

      const hashPassword = await bcrypt.hash(password, 3)
      const user = await User.create({ login, email, role, password: hashPassword })
      return new UserDTO(user)
    } catch (error) {
      throw error
    }
  },
  async login(req: Request) {
    try {
      const { email, password }: Pick<UserDocument, 'email' | 'password'> = req.body
      const dbUser = await User.findOne({ email })

      if (!dbUser) {
        throw { message: 'user.unexist' }
      }

      const isPasswordsEquals = await bcrypt.compare(password, dbUser.password)

      if (!isPasswordsEquals) {
        throw { message: 'password.incorrect' }
      }

      const userDTO = new UserDTO(dbUser)
      const tokens = tokenService.generateTokens({ ...userDTO })

      await tokenService.saveToken(userDTO._id, tokens.refreshToken)

      return { ...tokens, user: userDTO }
    } catch (error) {
      throw error
    }
  },
  async logout(req: Request, res: Response) {
    if (!req.cookies?.['refreshToken']) {
      throw { message: 'user.unauthorized' }
    }

    const { refreshToken } = req.cookies
    res.clearCookie('refreshToken')
    
    try {
      return await tokenService.removeToken(refreshToken)
    } catch (error) {
      throw error
    }
  },
  async getList() {
    try {
      const dbUsers = await User.find()
    
      if (!dbUsers) {
        throw { message: 'users.unexist' }
      }

      return dbUsers
    } catch (error) {
      throw error
    }
  },
  async refresh(req: Request) {
    if (!req.cookies?.['refreshToken']) {
      throw { message: 'user.unauthorized' }
    }

    try {
      const { refreshToken } = req.cookies
      const userData = tokenService.validateRefreshToken(refreshToken)
      const dbToken = await tokenService.findToken(refreshToken)

      if (!userData || !dbToken) {
        throw { message: 'user.unauthorized' }
      }

      const dbUser = await User.findById(userData['_id'])

      if (!dbUser) {
        throw { message: 'user.unexist' }
      }

      const userDTO = new UserDTO(dbUser)
      const tokens = tokenService.generateTokens({ ...userDTO })

      await tokenService.saveToken(userDTO._id, tokens.refreshToken)

      return { ...tokens, user: userDTO }
    } catch (error) {
      throw error
    }
  },
  async remove(req: Request, res: Response) {
    if (!req.cookies?.['refreshToken']) {
      throw { message: 'user.unauthorized' }
    }

    if (!req.params['id']) {
      throw { message: 'required.userId' }
    }

    const { refreshToken } = req.cookies
    res.clearCookie('refreshToken')

    try {
      await tokenService.removeToken(refreshToken)
      await User.deleteOne({ _id: req.params['id'] })

      return { message: 'success' }
    } catch (error) {
      throw error
    }
  }
}
