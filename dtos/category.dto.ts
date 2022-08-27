import 'module-alias/register'
// import { AlbumResponse } from '~/types/Album'
import {/* CategoryPageResponse, CategoryResponse, */CategoryDocument } from '~/types/Category'
// import { AlbumItemDTO } from './album.dto'

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

// export class CategoryPageDTO extends CategoryItemDTO {
//   poster: string
//   albums: AlbumItemDTO[]
//   frames: any

//   constructor(category: CategoryPageResponse, albums: AlbumResponse[]) {
//     super(category)

//     this.avatar = category.avatar
//     this.poster = category.poster
//     this.title = category.title
//     this._id = category._id
//     // @ts-ignore
//     this.albums = albums.map((album) => new AlbumItemDTO(album))
//     this.frames = category.framesAlbums
//   }
// }
