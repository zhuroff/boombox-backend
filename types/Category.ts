import 'module-alias/register'
import { Document, Types, PaginateModel } from 'mongoose'
import { CategoryItemDTO } from '~/dtos/category.dto'
import { PaginationDTO } from '~/dtos/pagination.dto'
import { AlbumResponse } from './Album'

type CategoryKeys = {
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
}

type CategoryBasic = {
  _id: Types.ObjectId
  title: string
}

interface CategoryAlbum {
  [key: string]: Types.ObjectId | string | undefined
}

interface CategoryModel extends Document {
  _id: Types.ObjectId
  title: string
  dateCreated: Date
  poster: string
  avatar: string
  albums: Types.ObjectId[]
  framesAlbums: Types.ObjectId[]
}

interface ICategory<T extends Document> extends PaginateModel<T> {}

type CategoryResponse = {
  _id: Types.ObjectId,
  title: string,
  avatar: string,
  albums: Types.ObjectId[],
  framesAlbums: Types.ObjectId[]
}

type CategoryPageResponse = CategoryResponse & {
  poster: string
  albums: AlbumResponse[]
}

type CategoriesPageResponse = {
  docs: CategoryItemDTO[]
  pagination: PaginationDTO
}

export {
  CategoryKeys,
  CategoryBasic,
  CategoryModel,
  CategoryAlbum,
  ICategory,
  CategoryResponse,
  CategoryPageResponse,
  CategoriesPageResponse
}
