import { Document, Types, PaginateModel } from 'mongoose'
import { CategoryBasic } from './Category'

interface CloudTrack {
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
  TrackModelDocument,
  TrackModelPaginated
}
