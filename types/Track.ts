import { Document, Types, PaginateModel } from 'mongoose'

interface CloudTrack {
  modified: string
  isfolder: false
  fileid: number
  contenttype: 'audio/flac'
  title: string
}

interface TrackModel {
  _id: Types.ObjectId
  fileid: number
  title: string
  lyrics: string
  duration: number
  listened: number
  link?: string
  inAlbum: Types.ObjectId
  inPlaylists: Types.ObjectId[]
  artist: Types.ObjectId
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
  TrackModelDocument,
  TrackModelPaginated
}
