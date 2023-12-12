import { Document, Types } from 'mongoose'
import { BasicEntity } from './common.types'
import { CloudFile, CloudKeys } from './cloud.types'
import { AlbumModel } from './album.types'

export type TrackModel = {
  title: string
  fileName: string
  cloudURL: CloudKeys
  dateCreated: Date
  created: Date
  modified: Date
  path: string
  mimeType: string
  lyrics?: string
  duration?: number
  listened?: number
  inAlbum: Types.ObjectId
  inPlaylists?: Types.ObjectId[]
  artist: Types.ObjectId
}

export type TrackExtPlaylist = {
  _id: Types.ObjectId
  inPlaylists: Types.ObjectId[]
}

export type TrackReqPayload = Omit<CloudFile, 'file' | 'name' | 'type'> & {
  title: string
}

type ExcludedTrackFields = 'artist' | 'inAlbum' | 'inPlaylists'

export type TrackResponse = Omit<TrackModel, ExcludedTrackFields> & {
  _id: string
  file: string
  artist: BasicEntity
  inAlbum: AlbumModel
  inPlaylists?: BasicEntity[]
  cover?: string
}

export type TrackSearchPayload = {
  title: string,
  thumbnail: string,
  artist: string,
  lyrics: string
}

export interface TrackDocument extends Document, TrackModel { }