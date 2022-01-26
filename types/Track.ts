import { Document, Types, PaginateModel } from 'mongoose'

interface TrackModel {
  fileid: number
  title: string
  lyrics: string
  duration: number
  listened: number
  link?: string
  inAlbum: Types.ObjectId
  inPlaylists: Types.ObjectId[]
}

interface TrackModelDocument extends TrackModel, Document {
  _id: Types.ObjectId
  _doc: TrackModel
  dateCreated: Date
}

interface TrackModelPaginated<T extends Document> extends PaginateModel<T> {}

export {
  TrackModel,
  TrackModelDocument,
  TrackModelPaginated
}
