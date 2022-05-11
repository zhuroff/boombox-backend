import 'module-alias/register'
import { Types } from 'mongoose'
import { CollectionModel, CollectionModelAlbum } from '~/types/Collection'

export class CollectionItemDTO {
  _id: Types.ObjectId
  title: string
  poster?: string
  avatar?: string
  albums: CollectionModelAlbum[]

  constructor(playlist: CollectionModel) {
    this._id = playlist._id
    this.title = playlist.title
    this.albums = playlist.albums
    this.avatar = playlist.avatar
    this.poster = playlist.poster
  }
}
