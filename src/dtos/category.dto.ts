import { CategoryDocument, CategoryResponse } from '../types/category.types'
import { EmbeddedResponse } from '../types/Embedded'
import { AlbumItemDTO } from './album.dto'
import { EntityBasicDTO } from './basic.dto'

export class CategoryItemDTO extends EntityBasicDTO {
  albums: number
  avatar: string

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
  poster?: string
  avatar?: string
  albums: AlbumItemDTO[]
  embeddedAlbums: EmbeddedResponse[]

  constructor(category: CategoryResponse, albums: AlbumItemDTO[]) {
    super(category._id, category.title)
    this.poster = category.poster
    this.avatar = category.avatar
    this.albums = albums
    this.embeddedAlbums = category.embeddedAlbums
  }
}
