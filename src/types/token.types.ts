import { Document, Types, RootFilterQuery, DeleteResult } from 'mongoose'
import { TokenDocument } from '../models/token.model'

export interface TokenRepository {
  createToken(payload: Record<string, string | Types.ObjectId>): Promise<TokenDocument>
  removeToken(refreshToken: string): Promise<DeleteResult>
  getToken(payload: RootFilterQuery<{ user: string | Types.ObjectId }>): Promise<(
    Document<unknown, {}, TokenDocument>
    & {
        refreshToken: string
        user?: Types.ObjectId | null | undefined
      }
  ) | null>
}
