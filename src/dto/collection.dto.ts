import { CollectionDocument, CollectionDocumentAlbum } from '../models/collection.model'
import GatheringEntity from './gathering.dto'

export class CollectionDTO extends GatheringEntity {
  albums: CollectionDocumentAlbum[]

  constructor(collection: CollectionDocument) {
    super(collection)
    this.albums = collection.albums
  }
}
