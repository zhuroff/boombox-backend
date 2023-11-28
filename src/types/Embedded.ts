import { Document, Types } from 'mongoose'
import { BasicEntity } from './common.types'

export type EmbeddedModel = {
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  frame: string,
  inCollections?: Types.ObjectId[]
}

type ExcludedEmbeddedFields = 'artist' | 'genre' | 'period' | 'inCollections'

export type EmbeddedResponse = Omit<EmbeddedModel, ExcludedEmbeddedFields> & {
  _id: string
  artist: BasicEntity
  genre: BasicEntity
  period: BasicEntity
  inCollections: BasicEntity[]
}

export interface EmbeddedDocument extends Document, EmbeddedModel { }
