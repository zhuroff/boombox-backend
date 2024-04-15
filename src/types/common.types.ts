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
  | 'users'
  | 'tokens'

export interface BasicEntity {
  _id: Types.ObjectId
  title: string
}

export interface GatheringCreatePayload {
  entityID: string
  title: string
}

export interface GatheringUpdatePayload {
  entityID: Types.ObjectId | string
  gatheringID: string
  isInList: boolean
  order: number
}

export interface GatheringUpdateProps {
  itemID: string | Types.ObjectId
  inList: boolean
  listID: string
  order?: number
}

export interface GatheringReorder {
  oldOrder: number
  newOrder: number
}

export type CategoryDocument = ArtistDocument | GenreDocument | PeriodDocument
