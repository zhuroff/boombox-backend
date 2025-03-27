import { Types } from 'mongoose'
import { TokenRepository } from '../types/common.types'
import { UserDTO } from '../dto/user.dto'
import jwt from 'jsonwebtoken'

export default class TokenService {
  constructor(private tokenRepository: TokenRepository) {}

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
  }

  async getToken(refreshToken: string) {
    return await this.tokenRepository.getToken({ refreshToken })
  }

  async saveToken(userID: Types.ObjectId, refreshToken: string) {
    const dbToken = await this.tokenRepository.getToken({ user: userID })
    
    if (dbToken) {
      dbToken.refreshToken = refreshToken
      return dbToken.save()
    }

    return await this.tokenRepository.createToken({ user: userID, refreshToken })
  }

  async removeToken(refreshToken: string) {
    return await this.tokenRepository.removeToken(refreshToken)
  }

  validateRefreshToken(token: string) {
    const userData = jwt.verify(token, String(process.env['JWT_REFRESH_TOKEN']))
    return userData as jwt.JwtPayload
  }
}