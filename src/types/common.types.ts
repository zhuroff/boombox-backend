import { Types } from 'mongoose'
import { ArtistDocument } from '../models/artist.model'
import { GenreDocument } from '../models/genre.model'
import { PeriodDocument } from '../models/period.model'

export type ModelKeys =
  | 'albums'
  | 'embedded'
  | 'artists'
  | 'genres'
  | 'periods'
  | 'collections'
  | 'compilations'
  | 'tracks'
  | 'radio'
  | 'users'
  | 'tokens'

export interface BasicEntity {
  _id: Types.ObjectId
  title: string
}

export interface CompilationCreatePayload {
  entityID: string
  title: string
}

export interface CompilationUpdatePayload {
  entityID: Types.ObjectId | string
  gatheringID: string
  isInList: boolean
  order: number
}

export type CategoryDocument = ArtistDocument | GenreDocument | PeriodDocument
