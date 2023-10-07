import { Document, Types } from 'mongoose'
import { CategoryBasic } from './Category'

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
  artist: CategoryBasic
  genre: CategoryBasic
  period: CategoryBasic
  inCollections: CategoryBasic[]
}

export interface EmbeddedDocument extends Document, EmbeddedModel { }
