import { Types } from 'mongoose'
import { CategoryDocument, CategoryResponse } from '../types/Category'
import { FrameResponse } from '../types/Frame'
import { AlbumItemDTO } from './album.dto'

export class CategoryBasicDTO {
  title: string
  _id: Types.ObjectId

  constructor(id: Types.ObjectId, title: string) {
    this.title = title
    this._id = id
  }
}

export class CategoryItemDTO extends CategoryBasicDTO {
  albums: number
  avatar: string

  #calcAlbumsLength(category: CategoryDocument) {
    return (
      (category.albums?.length || 0) +
      (category.framesAlbums?.length || 0)
    )
  }

  constructor(category: CategoryDocument) {
    super(category._id, category.title)
    this.albums = this.#calcAlbumsLength(category)
    this.avatar = category.avatar
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
