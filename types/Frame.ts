import { Document, Types } from 'mongoose'
import { CategoryBasic } from './Category'

export type FrameModel = {
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  frame: string,
  inCollections?: Types.ObjectId[]
}

type ExcludedFrameFields = 'artist' | 'genre' | 'period' | 'inCollections'

export type FrameResponse = Omit<FrameModel, ExcludedFrameFields> & {
  _id: string
  artist: CategoryBasic
  genre: CategoryBasic
  period: CategoryBasic
  inCollections: CategoryBasic[]
}

export interface FrameDocument extends Document, FrameModel { }
