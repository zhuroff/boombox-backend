import { Document, Types } from 'mongoose'
import { BasicEntity } from './common.types'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { TrackResponse } from './Track'
import { CloudKeys } from './Cloud'

export type ExcludedAlbumFields = 'artist' | 'genre' | 'period' | 'inCollections' | 'tracks'

export interface AlbumShape {
  title: string
  folderName: string
  cloudURL: CloudKeys
  artist: string
  genre: string
  period: string
  tracks: Array<Required<CloudEntityDTO>>
}

export interface AlbumModel {
  title: string
  folderName: string
  cloudURL: CloudKeys
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  modified: Date
  created: Date
  tracks: Types.ObjectId[]
  inCollections: Types.ObjectId[]
}

export interface AlbumResponse extends Omit<AlbumModel, ExcludedAlbumFields> {
  _id: string
  albumCover: string
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
