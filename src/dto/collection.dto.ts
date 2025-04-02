import { AlbumDocument } from '../models/album.model'
import { CollectionDocument } from '../models/collection.model'
import EntityBasicView from '../views/BasicEntityView'
import GatheringEntity from './gathering.dto'

export class CollectionItemDTO extends GatheringEntity {
  albums: EntityBasicView[]

  constructor(collection: CollectionDocument) {
    super(collection)
    this.albums = collection.albums.map(({ album }) => {
      const { _id, title, cloudURL } = album as AlbumDocument
      return new EntityBasicView(_id, title, cloudURL)
    })
  }
}

export class CollectionPageDTO extends GatheringEntity {
  albums: Array<any & { order: number }>

  constructor(collection: CollectionDocument, albums: any[]) {
    super(collection)
    this.albums = albums.map((album) => ({
      ...album,
      order: collection.albums.find((el) => el.album._id.toString() === album._id.toString())?.order || 0
    }))
  }
}
