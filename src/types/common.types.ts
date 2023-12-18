import { Types } from 'mongoose'

export type ModelKeys =
  | 'albums'
  | 'embedded'
  | 'artists'
  | 'genres'
  | 'periods'
  | 'collections'
  | 'playlists'
  | 'tracks'
  | 'radio'
  | 'users'
  | 'tokens'
  | 'toys'

export interface BasicEntity {
  _id: Types.ObjectId
  title: string
}

export interface CompilationCreatePayload {
  entityID: string
  title: string
}

export interface CompilationUpdatePayload {
  entityID: string
  gatheringID: string
  isInList: boolean
  order: number
}
