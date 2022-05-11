import 'module-alias/register'
import { Types } from 'mongoose'
import { AlbumResponse } from '~/types/Album'
import { CategoryPageResponse, CategoryResponse } from '~/types/Category'
import { AlbumItemDTO } from './album.dto'

export class CategoryItemDTO {
  albums: number | AlbumItemDTO[]
  avatar: string
  title: string
  _id: Types.ObjectId

  constructor(category: CategoryResponse) {
    this.albums = category.albums.length + category.framesAlbums.length
    this.avatar = category.avatar
    this.title = category.title
    this._id = category._id
  }
}

export class CategoryPageDTO extends CategoryItemDTO {
  poster: string
  albums: AlbumItemDTO[]
  frames: any

  constructor(category: CategoryPageResponse, albums: AlbumResponse[]) {
    super(category)

    this.avatar = category.avatar
    this.poster = category.poster
    this.title = category.title
    this._id = category._id
    this.albums = albums.map((album) => new AlbumItemDTO(album))
    this.frames = category.framesAlbums
  }
}
