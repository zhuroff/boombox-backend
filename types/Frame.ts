import { Document, Types, PaginateModel } from 'mongoose'

interface FrameModel {
  _id?: Types.ObjectId
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  iframe: string,
  inCollections: Types.ObjectId[]
}

interface FrameModelDocument extends FrameModel, Document {
  _id: Types.ObjectId
  _doc: FrameModel
  dateCreated: Date
}

interface FrameModelPaginated<T extends Document> extends PaginateModel<T> {}

export {
  FrameModel,
  FrameModelDocument,
  FrameModelPaginated
}
