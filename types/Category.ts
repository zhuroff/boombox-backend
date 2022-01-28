import { Document, Types, PaginateModel } from 'mongoose'

type CategoryKeys = 'artist' | 'genres' | 'period'

interface CategoryAlbum {
  [key: string]: Types.ObjectId | string | undefined
}

interface CategoryModel extends Document {
  _id: Types.ObjectId
  title: string
  dateCreated: Date
  poster: string
  avatar: string
  albums: [Types.ObjectId]
  framesAlbums: [Types.ObjectId]
}

interface ICategory<T extends Document> extends PaginateModel<T> {}

interface ICategoryDocs {
  _id: Types.ObjectId,
  title: string,
  avatar: string,
  albums: number
}

interface ICategoryFullDocs extends ICategoryDocs {
  poster: string
  albums: any
  framesAlbums: any
}

interface ICategoryResponse {
  docs: ICategoryDocs[]

  pagination: {
    totalDocs: number
    limit: number
    totalPages: number
    page: number
  }
}

export {
  CategoryKeys,
  CategoryModel,
  CategoryAlbum,
  ICategory,
  ICategoryDocs,
  ICategoryFullDocs,
  ICategoryResponse
}
