import { RootFilterQuery, Types } from 'mongoose'
import { Token } from '../models/token.model'
import { TokenRepository } from '../types/token.types'

export default class TokenRepositoryContract implements TokenRepository {
  async getToken(payload: RootFilterQuery<{ user: string | Types.ObjectId }>) {
    return await Token.findOne(payload)
  }

  async createToken({ user, refreshToken }: Record<string, string>) {
    return await Token.create({ user, refreshToken })
  }

  async removeToken(refreshToken: string) {
    return await Token.deleteOne({ refreshToken })
  }
}