import { AlbumDocument } from '../models/album.model'
import { CollectionDocument } from '../models/collection.model'
import { AlbumItemDTO } from './album.dto'
import { EntityBasicDTO } from './basic.dto'
import GatheringEntity from './gathering.dto'

export class CollectionItemDTO extends GatheringEntity {
  albums: EntityBasicDTO[]

  constructor(collection: CollectionDocument) {
    super(collection)
    this.albums = collection.albums.map(({ album }) => {
      const { _id, title, cloudURL } = album as AlbumDocument
      return new EntityBasicDTO(_id, title, cloudURL)
    })
  }
}

export class CollectionPageDTO extends GatheringEntity {
  albums: Array<AlbumItemDTO & { order: number }>

  constructor(collection: CollectionDocument, albums: AlbumItemDTO[]) {
    super(collection)
    this.albums = albums.map((album) => ({
      ...album,
      order: collection.albums.find((el) => el.album._id.toString() === album._id.toString())?.order || 0
    }))
  }
}
