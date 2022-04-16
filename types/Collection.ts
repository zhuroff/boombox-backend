import { Types } from 'mongoose'
import { AlbumResponse } from './Album'

type CollectionModelAlbum = {
  _id: Types.ObjectId
  album: Types.ObjectId | AlbumResponse
  order: number
}

type ICollectionModel = {
  title: string
  dateCreated: Date
  cover: string
  poster: string
  albums: CollectionModelAlbum[]
}

type CollectionListItem = {
  order: number
  _id: Types.ObjectId
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

export {
  CollectionModelAlbum,
  ICollectionModel,
  CollectionListItem,
  DeletedCollectionAlbum,
  CollectionUpdateProps
}
