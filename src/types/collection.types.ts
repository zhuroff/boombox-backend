import { Document, Types } from 'mongoose'

// export type CollectionModelAlbum = {
//   _id: Types.ObjectId
//   album: Types.ObjectId | AlbumResponse
//   order: number
// }

export interface CollectionModel {
  title: string
  dateCreated: Date
  avatar: string
  poster: string
  albums: Types.ObjectId[]
}

// export type CollectionListItem = {
//   _id: Types.ObjectId
//   order: number
//   album: Partial<AlbumResponse>
// }

// export type DeletedCollectionAlbum = {
//   listID: string
//   itemID: Types.ObjectId
// }

// export type CollectionUpdateProps = {
//   inList: boolean
//   itemID: string
//   listID: string
//   order: number
// }

export interface CollectionReorder {
  oldOrder: number
  newOrder: number
}

export interface CollectionDocument extends Document, CollectionModel { }
