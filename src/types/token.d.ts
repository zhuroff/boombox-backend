import { Types, QueryFilter, DeleteResult, HydratedDocument } from 'mongoose'
import { TokenDocument } from '../models/token.model'

export interface TokenRepository {
  createToken(payload: Record<string, string | Types.ObjectId>): Promise<TokenDocument>
  removeToken(refreshToken: string): Promise<DeleteResult>
  getToken(payload: QueryFilter<TokenDocument>): Promise<HydratedDocument<TokenDocument> | null>
}
