import 'module-alias/register'
import { Document, Types } from 'mongoose'
import { CategoryItemDTO } from '~/dtos/category.dto'
import { PaginationDTO } from '~/dtos/pagination.dto'
// import { AlbumResponse } from './Album'

export type CategoryKeys = {
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
}

export type CategoryBasic = {
  _id: Types.ObjectId
  title: string
}

export type CategoryAlbum = {
  [key: string]: Types.ObjectId | string | undefined
}

export type CategoryModel = {
  title: string
  dateCreated: Date
  poster: string
  avatar: string
  albums: Types.ObjectId[]
  framesAlbums: Types.ObjectId[]
}

// export type CategoryResponse = {
//   _id: Types.ObjectId,
//   title: string,
//   avatar: string,
//   albums: Types.ObjectId[],
//   framesAlbums: Types.ObjectId[]
// }
// export type CategoryResponse = Omit<CategoryDocument, 'albums' | 'framesAlbums'> & {
//   albums: 
//   framesAlbums: 
// }

// export type CategoryPageResponse = CategoryResponse & {
//   poster: string
//   albums: AlbumResponse[]
// }

export type CategoriesPageResponse = {
  docs: CategoryItemDTO[]
  pagination: PaginationDTO
}

export interface CategoryDocument extends Document, CategoryModel { }
