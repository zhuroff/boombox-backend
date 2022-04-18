import { Types } from 'mongoose'
import { CollectionModel, CollectionModelAlbum } from '~/types/Collection'

export class CollectionItemDTO {
  _id: Types.ObjectId
  title: string
  poster?: string
  cover?: string
  albums: CollectionModelAlbum[]

  constructor(playlist: CollectionModel) {
    this._id = playlist._id
    this.title = playlist.title
    this.albums = playlist.albums
    this.cover = playlist.cover
    this.poster = playlist.poster
  }
}
