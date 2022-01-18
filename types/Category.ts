import { Document, Types, PaginateModel } from 'mongoose'

interface CategoryModel extends Document {
  title: string
  dateCreated: Date
  poster: string
  avatar: string
  albums: [Types.ObjectId]
  framesAlbums: [Types.ObjectId]
}

interface ICategory<T extends Document> extends PaginateModel<T> {}

export {
  CategoryModel,
  ICategory
}
