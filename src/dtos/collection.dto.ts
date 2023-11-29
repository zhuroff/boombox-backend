import { Types } from 'mongoose'
import { CollectionDocument } from '../types/collection.types'
import { EntityBasicDTO } from './basic.dto'

export class CollectionItemDTO extends EntityBasicDTO {
  poster?: string
  avatar?: string
  albums: Types.ObjectId[]

  constructor(collection: CollectionDocument) {
    super(collection._id, collection.title)
    this.poster = collection.poster
    this.avatar = collection.avatar
    // @ts-ignore
    this.albums = collection.albums.map(({ album }) => album)
  }
}

// export class CollectionItemDTO {
//   _id: Types.ObjectId
//   title: string
//   poster?: string
//   avatar?: string
//   albums: AlbumItemDTO[]

//   constructor(collection: CollectionResponse) {
//     this._id = collection._id
//     this.title = collection.title
//     this.albums = collection.albums
//     this.avatar = collection.avatar
//     this.poster = collection.poster
//   }
// }
