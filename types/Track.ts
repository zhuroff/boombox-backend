import { Document, Types, PaginateModel } from 'mongoose'
import { CategoryBasic } from './Category'

type CloudTrack = {
  modified: string
  isfolder: false
  fileid: number
  contenttype: 'audio/flac'
  title: string
}

type TrackCommon = {
  _id: Types.ObjectId
  fileid: number
  title: string
  duration: number
  listened: number
  inAlbum: Types.ObjectId
  inPlaylists: Types.ObjectId[]
}

type TrackModel = TrackCommon & {
  lyrics: string
  artist: Types.ObjectId
}

type TrackResponse = TrackCommon & {
  link: string
  artist: CategoryBasic
}

type TrackSearchPayload = {
  title: string
  thumbnail: string
  artist: string
  lyrics: string
}

interface TrackModelDocument extends TrackModel, Document {
  _id: Types.ObjectId
  _doc: TrackModel
  dateCreated: Date
}

interface TrackModelPaginated<T extends Document> extends PaginateModel<T> {}

export {
  CloudTrack,
  TrackModel,
  TrackResponse,
  TrackSearchPayload,
  TrackModelDocument,
  TrackModelPaginated
}
