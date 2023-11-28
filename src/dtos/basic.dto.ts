import { Types } from 'mongoose'
import { BasicEntity } from '../types/common.types'

export class EntityBasicDTO implements BasicEntity {
  title: string
  _id: Types.ObjectId

  constructor(id: Types.ObjectId, title: string) {
    this.title = title
    this._id = id
  }
}
