import { PaginateResult, Types } from 'mongoose'
import { EmbeddedDocument } from '../models/embedded.model'
import { ListRequestConfig } from './pagination'

export interface EmbeddedPayload {
  artist: string
  frame: string
  genre: string
  period: string
  title: string
}

export interface EmbeddedRepository {
  createEmbedded(payload: EmbeddedPayload): Promise<EmbeddedDocument>
  getPopulatedEmbedded(id: string | Types.ObjectId): Promise<EmbeddedDocument | null>
  getPopulatedEmbeddedList(payload: ListRequestConfig): Promise<PaginateResult<EmbeddedDocument | null>>
  removeEmbedded(_id: string | Types.ObjectId): Promise<void>
}
