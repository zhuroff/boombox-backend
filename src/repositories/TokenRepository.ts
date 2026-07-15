import { QueryFilter } from 'mongoose'
import { Token, TokenDocument } from '../models/token.model'
import { TokenRepository } from '../types/token'

export default class TokenRepositoryContract implements TokenRepository {
  async getToken(payload: QueryFilter<TokenDocument>) {
    return await Token.findOne(payload)
  }

  async createToken({ user, refreshToken }: Record<string, string>) {
    return await Token.create({ user, refreshToken })
  }

  async removeToken(refreshToken: string) {
    return await Token.deleteOne({ refreshToken })
  }
}
