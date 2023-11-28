import { Document, Types } from 'mongoose'
import { BasicEntity } from './common.types'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { TrackResponse } from './Track'

export interface AlbumShape {
  title: string
  folderName: string
  artist: string
  genre: string
  period: string
  tracks: Array<Required<CloudEntityDTO>>
}

export interface AlbumModel {
  title: string
  folderName: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  albumCover: string
  albumCoverArt?: string
  modified: Date
  created: Date
  tracks: Types.ObjectId[]
  inCollections: Types.ObjectId[]
}

export type ExcludedAlbumFields = 'artist' | 'genre' | 'period' | 'inCollections' | 'tracks'

export type AlbumResponse = Omit<AlbumModel, ExcludedAlbumFields> & {
  _id: string
  artist: BasicEntity
  genre: BasicEntity
  period: BasicEntity
  inCollections: BasicEntity[]
  tracks: TrackResponse[]
}

export interface DiscogsPayload {
  artist: string
  album: string
  page: number
}

export interface AlbumDocument extends Document, AlbumModel { }
