import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
import { Token } from '../models/token.model'
import { UserDTO } from '../dto/user.dto'

export default {
  generateTokens(payload: UserDTO) {
    const accessToken = jwt.sign(
      payload,
      process.env['JWT_SECRET_TOKEN'] as string,
      { expiresIn: '24h' }
    )

    const refreshToken = jwt.sign(
      payload,
      process.env['JWT_REFRESH_TOKEN'] as string,
      { expiresIn: '24h' }
    )

    return {
      accessToken,
      refreshToken
    }
  },

  validateAccessToken(token: string) {
    try {
      const userData = jwt.verify(token, String(process.env['JWT_SECRET_TOKEN']))
      return userData as jwt.JwtPayload
    } catch (ignore) {
      return null
    }
  },

  validateRefreshToken(token: string) {
    try {
      const userData = jwt.verify(token, String(process.env['JWT_REFRESH_TOKEN']))
      return userData as jwt.JwtPayload
    } catch (ignore) {
      return null
    }
  },

  async saveToken(userID: Types.ObjectId, refreshToken: string) {
    try {
      const dbToken = await Token.findOne({ user: userID })

      if (dbToken) {
        dbToken.refreshToken = refreshToken
        return dbToken.save()
      }

      return await Token.create({ user: userID, refreshToken })
    } catch (error) {
      throw error
    }
  },

  async removeToken(refreshToken: string) {
    try {
      return await Token.deleteOne({ refreshToken })
    } catch (error) {
      throw error
    }
  },

  async findToken(refreshToken: string) {
    try {
      return await Token.findOne({ refreshToken })
    } catch (error) {
      throw error
    }
  }
}
