import { Document, Types } from 'mongoose';
import { CategoryBasic } from './Category';
import { CloudFile } from './Cloud';

export type TrackModel = {
  title: string
  fileName: string
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
  artist: CategoryBasic
  inAlbum: CategoryBasic
  inPlaylists?: CategoryBasic[]
}

export type TrackSearchPayload = {
  title: string,
  thumbnail: string,
  artist: string,
  lyrics: string
}

export interface TrackDocument extends Document, TrackModel { }