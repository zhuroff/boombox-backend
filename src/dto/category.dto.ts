import { EmbeddedDocument } from '../models/embedded.model'
import { CategoryDocument } from '../types/common.types'
import { AlbumItemDTO } from './album.dto'
import { EntityBasicDTO } from './basic.dto'

export class CategoryItemDTO extends EntityBasicDTO {
  albums: number
  avatar?: string | null

  #calcAlbumsLength(category: CategoryDocument) {
    return (
      (category.albums?.length || 0) +
      (category.embeddedAlbums?.length || 0)
    )
  }

  constructor(category: CategoryDocument) {
    super(category._id, category.title)
    this.albums = this.#calcAlbumsLength(category)
    this.avatar = category.avatar
  }
}

export class CategoryPageDTO extends EntityBasicDTO {
  poster?: string | null
  avatar?: string | null
  albums: AlbumItemDTO[]
  embeddedAlbums?: EmbeddedDocument[]

  constructor(category: CategoryDocument) {
    super(category._id, category.title)
    this.poster = category.poster
    this.avatar = category.avatar
    this.albums = category.albums.map((album) => new AlbumItemDTO(album))
    this.embeddedAlbums = category.embeddedAlbums
  }
}
