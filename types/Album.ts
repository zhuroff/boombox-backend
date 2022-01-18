import { Document, Types, PaginateModel } from 'mongoose'

interface AlbumModel extends Document {
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  albumCover: number | string
  albumCoverArt: number
  coverID?: number
  folderid: number
  modified: Date
  description: string
  tracks: [{
    fileid: number
    title: string
    lyrics: string
    duration: number
    listened: number
  }]
}

interface AlbumModelPaginated<T extends Document> extends PaginateModel<T> {}

export {
  AlbumModel,
  AlbumModelPaginated
}
