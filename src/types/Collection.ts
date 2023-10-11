import { Types } from 'mongoose'
import { AlbumResponse } from './album.types'

export type CollectionModelAlbum = {
  _id: Types.ObjectId
  album: Types.ObjectId | AlbumResponse
  order: number
}

export type CollectionModel = {
  _id: Types.ObjectId
  title: string
  dateCreated: Date
  avatar: string
  poster: string
  albums: CollectionModelAlbum[]
}

export type CollectionListItem = {
  _id: Types.ObjectId
  order: number
  album: Partial<AlbumResponse>
}

export type DeletedCollectionAlbum = {
  listID: string
  itemID: Types.ObjectId
}

export type CollectionUpdateProps = {
  inList: boolean
  itemID: string
  listID: string
  order: number
}

export type CollectionReorder = {
  oldOrder: number
  newOrder: number
}
