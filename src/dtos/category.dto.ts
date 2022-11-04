import { CategoryDocument, CategoryResponse } from '../types/Category'
import { FrameResponse } from '../types/Frame'
import { AlbumItemDTO } from './album.dto'

export class CategoryItemDTO {
  albums: number
  avatar: string
  title: string
  _id: string

  #calcAlbumsLength(category: CategoryDocument) {
    return (
      (category.albums?.length || 0) +
      (category.framesAlbums?.length || 0)
    )
  }

  constructor(category: CategoryDocument) {
    this.albums = this.#calcAlbumsLength(category)
    this.avatar = category.avatar
    this.title = category.title
    this._id = category._id
  }
}

export class CategoryPageDTO {
  _id: string
  title: string
  poster?: string
  avatar?: string
  albums: AlbumItemDTO[]
  framesAlbums: FrameResponse[]

  constructor(category: CategoryResponse, albums: AlbumItemDTO[]) {
    this._id = category._id
    this.title = category.title
    this.poster = category.poster
    this.avatar = category.avatar
    this.albums = albums
    this.framesAlbums = category.framesAlbums
  }
}
