import { Model, Types, HydratedDocument } from 'mongoose'

export interface FileLinkPayload {
  fieldname: string
  filename: string
}

export interface FileRepository {
  updateModelFileLink<T>(
    payload: FileLinkPayload,
    _id: Types.ObjectId | string,
    Model: Model<T>
  ): Promise<HydratedDocument<T> | null>
}
