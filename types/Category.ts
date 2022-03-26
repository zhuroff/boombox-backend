import { Document, Types, PaginateModel } from 'mongoose'

type CategoryKeys = 'artist' | 'genres' | 'period'

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

interface ICategoryDocs {
  _id: Types.ObjectId,
  title: string,
  avatar: string,
  albums: number | Types.ObjectId[]
}

interface ICategoryResponse {
  docs: ICategoryDocs[]

  pagination: {
    totalDocs: number
    totalPages: number
    page: number
  }
}

export {
  CategoryKeys,
  CategoryBasic,
  CategoryModel,
  CategoryAlbum,
  ICategory,
  ICategoryDocs,
  ICategoryResponse
}
