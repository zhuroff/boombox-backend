import { Types } from 'mongoose'
import { AlbumResponse } from './Album'

type CollectionModelAlbum = {
  _id: Types.ObjectId
  album: Types.ObjectId | AlbumResponse
  order: number
}

type CollectionModel = {
  _id: Types.ObjectId
  title: string
  dateCreated: Date
  avatar: string
  poster: string
  albums: CollectionModelAlbum[]
}

type CollectionListItem = {
  _id: Types.ObjectId
  order: number
  album: Partial<AlbumResponse>
}

type DeletedCollectionAlbum = {
  listID: string
  itemID: Types.ObjectId
}

type CollectionUpdateProps = {
  inList: boolean
  itemID: string
  listID: string
  order: number
}

type CollectionReorder = {
  oldOrder: number
  newOrder: number
}

export {
  CollectionModelAlbum,
  CollectionModel,
  CollectionListItem,
  DeletedCollectionAlbum,
  CollectionUpdateProps,
  CollectionReorder
}
