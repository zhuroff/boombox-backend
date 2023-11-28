import { Types } from 'mongoose'

export interface BasicEntity {
  _id: Types.ObjectId
  title: string
}
