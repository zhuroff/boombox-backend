import { Model, Types, Document, Default__v, IfAny, Require_id } from 'mongoose'

export interface FileLinkPayload {
  fieldname: string
  filename: string
}

export interface FileRepository {
  updateModelFileLink<T, U extends Model<T>>(
    payload: FileLinkPayload,
    _id: Types.ObjectId | string,
    Model: U
  ): Promise<IfAny<T, any, Document<unknown, {}, T> & Default__v<Require_id<T>>> | null>
}
