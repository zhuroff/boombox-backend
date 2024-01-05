import { Types } from 'mongoose'
import { BasicEntity } from '../types/common.types'

export class EntityBasicDTO implements BasicEntity {
  readonly _id: Types.ObjectId
  readonly title: string
  readonly cloudURL?: string

  constructor(id: Types.ObjectId, title: string, cloudURL?: string) {
    this._id = id
    this.title = title
    this.cloudURL = cloudURL
  }
}
