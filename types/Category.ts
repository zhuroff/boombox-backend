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

export {
  CategoryKeys,
  CategoryModel,
  CategoryAlbum,
  ICategory
}
